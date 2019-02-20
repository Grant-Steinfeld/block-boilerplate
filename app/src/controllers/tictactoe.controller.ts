import { Request, RestBindings, operation, requestBody, param, HttpErrors } from '@loopback/rest';
import { inject } from '@loopback/context';

import { TicTacToeBoard } from '../models/tic-tac-toe-board.model';

import { BlockChainModule } from '../blockchainClient';

let blockchainClient = new BlockChainModule.BlockchainClient();



const uuidv1 = require('uuid/v1');


export class TictactoeController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) { }



  /**
   *
   * @param id the boardUUID
   * @returns TicTacToeBoard
   */
  @operation('get', '/Tictactoe/{boardUUID}', {

    responses: {
      '200': {
        description: 'TicTacToeBoard model instance',
        content: { 'application/json': { schema: { 'x-ts-type': TicTacToeBoard } } },
      },
    },
  })
  async tictactoeFind(@param({ name: 'boardUUID', in: 'path' }) boardUUID: string): Promise<TicTacToeBoard> {
    return this.findBoardById(boardUUID);
  }

  async findBoardById(boardUUID: any):Promise<TicTacToeBoard>{

    let networkObj = await blockchainClient.connectToNetwork();
    let dataForQuery = {
      function: 'query',
      id: boardUUID,
      contract: networkObj.contract,
      network: networkObj.network
    };


    let result = await blockchainClient.queryByKey(dataForQuery);
    var rez = JSON.parse(result.toString());
    console.log(`lookup queryByKey key ${boardUUID}`);
    console.log(rez)

    if (rez.boardUUID){
      var boardFound: TicTacToeBoard = this.resultToBoard(rez)
      this.ppcells(boardFound.cells)
      return boardFound
    }
    else
    {
      let errmsg = `board not found by boardUUID ${boardUUID}`
      throw new HttpErrors.NotFound(errmsg);
    }

  }
  resultToBoard(rez: any): TicTacToeBoard {
      let cells = rez.cells.split(',');
      return new TicTacToeBoard({ boardUUID:rez.boardUUID, cells:cells, state:rez.state, winner:'' });
  }

  ppcells(cells: any){
    let ppcells: string = ''
    ppcells = ppcells + ' -|-|- \n'
    ppcells = ppcells + cells[0] + '|' + cells[1] + '|' + cells[2] + '\n';
    ppcells = ppcells + '_______\n'
    ppcells = ppcells + cells[3] + '|' + cells[4] + '|' + cells[5] + '\n';
    ppcells = ppcells + '_______\n'
    ppcells = ppcells + cells[6] + '|' + cells[7] + '|' + cells[8] + '\n';
    ppcells = ppcells + ' -|-|- \n'

    console.info(ppcells)
    return ppcells
  }
  /**
   *
   * Creates empty tictactoe board
   * @returns TicTacToeBoard
   */
  @operation('get', '/Tictactoe', {
    responses: {
      '200': {
        description: 'Tictactoe model instance',
        content: { 'application/json': { schema: { 'x-ts-type': TicTacToeBoard } } },
      },
    },
  })
  tictactoeCreate(): TicTacToeBoard {

      let cells = ['_','_','_','_','_','_','_','_','_'];
      return new TicTacToeBoard({boardUUID: this.getUUID(), 
        cells: cells, state:'initialized', winner:""})
  }


    /**
    * Update board by id ( UUID )
    * @param requestBody TicTacToeBoard Model instance data
    * @returns TicTacToeBoard
    */
  @operation('put', '/Tictactoe', {
    responses: {
      '200': {
        description: 'TicTacToeBoard model instance',
        content: { 'application/json': { schema: { 'x-ts-type': TicTacToeBoard } } },
      },
    },
  })
  async tictactoeUpdate(@requestBody() requestBody: TicTacToeBoard): Promise<TicTacToeBoard> {
    console.log(requestBody);

    try {
      requestBody.state = "underway"
      let networkObj = await blockchainClient.connectToNetwork();
      let dataForBoard = {
        board: requestBody,
        contract: networkObj.contract
      };

      await blockchainClient.makeMark(dataForBoard);


      let updatedBoardByContract = this.findBoardById(requestBody.boardUUID)
      return updatedBoardByContract

    } catch (error) {
      let errmsg = `board not found by boardUUID ${requestBody.boardUUID} -- ${error}`
      throw new HttpErrors.NotFound(errmsg);
    }

 


    
  } 

  getUUID():string{
    return uuidv1()
  }

}
