/* tslint:disable:no-any */
import {model, property} from '@loopback/repository';

/**
 * The model class TicTacToeCell 
 */
@model({name: 'TicTacToeCell'})
export class TicTacToeCell {
  constructor(data?: Partial<TicTacToeCell>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * USER NAME/INITIALS
   */
  @property({name: 'user', required: true, default:''})
  user: string;
  

  /**
   * X/0 X OR NAUGHT
   */
  @property({name: 'choice', required: true, default: '_'})
  choice: string;
  

  /**
   * 0-8
   */
  @property({name: 'position',default: -1})
  position: number;
}