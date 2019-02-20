import {model, property} from '@loopback/repository'

@model({name: 'TicTacToeBoard'})
export class TicTacToeBoard {
  
  constructor(data?: Partial<TicTacToeBoard>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  @property({name: 'boardUUID', required: true})
  boardUUID: string;

  @property({name: 'state', required: true, default: 'intialized'})
  state: string;

  @property({name: 'winner', required: false, default: ''})
  winner: string;
  
  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  cells: string[];

}
