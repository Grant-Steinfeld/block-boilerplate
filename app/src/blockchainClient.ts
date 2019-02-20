
import { TicTacToeBoard } from './models/tic-tac-toe-board.model';

const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');

// A wallet stores a collection of identities for use
const wallet = new FileSystemWallet('./local_fabric/wallet');


export module BlockChainModule {

  export class BlockchainClient {
    async connectToNetwork() {

      const gateway = new Gateway();

      try {
        console.log('connecting to Fabric network...')


        const identityLabel = 'Admin@org1.example.com';
        let connectionProfile = yaml.safeLoad(fs.readFileSync('./network.yaml', 'utf8'));

        let connectionOptions = {
          identity: identityLabel,
          wallet: wallet,
          discovery: {
            asLocalhost: true
          }
        };

        // Connect to gateway using network.yaml file and our certificates in _idwallet directory
        await gateway.connect(connectionProfile, connectionOptions);

        console.log('Connected to Fabric gateway.');

        // Connect to our local fabric
        const network = await gateway.getNetwork('mychannel');

        console.log('Connected to mychannel. ');

        // Get the contract we have installed on the peer
        const contract = await network.getContract('tictactoe-contractJS');


        let networkObj = {
          contract: contract,
          network: network
        };

        return networkObj;

      } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
      } finally {
        console.log('Done connecting to network.');
        // gateway.disconnect();
      }

    }

    /**
     *  put whole board 
     * @param args 
     */
    async makeMark(args: any) {
        //call makeMark (ctx, boardUUID, cells, state) 
        let board: TicTacToeBoard = args.board;
        let cells: string = board.cells.join(',')
        console.info(cells)

        let response = await args.contract.submitTransaction('makeMark',
        board.boardUUID, cells, board.state );
        return response;
 
    }


    async queryByKey(keyPassed: any) {

        // let str = 'query'
        // let response = await keyPassed.contract.submitTransaction('query', 'arg1', 'arg2');
  
        let response = await keyPassed.contract.submitTransaction('query', keyPassed.id);
        console.log('query by key response: ')
        console.log(JSON.parse(response.toString()))
        console.log(response.length)
        if (response.length === 2) {
          response = `${keyPassed.id} does not exist`;
          return response;
        }
        response = JSON.parse(response.toString());
        return response;
  
      }

    

    
  }
}

