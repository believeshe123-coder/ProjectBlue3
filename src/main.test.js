import {describe,expect,it} from 'vitest';
import {formatLength,lineLength,snap} from './drawing';
describe('drawing measurements',()=>{
 it('snaps coordinates to grid dots',()=>expect(snap(43,28)).toBe(56));
 it('measures lines in grid units',()=>expect(lineLength({x1:0,y1:0,x2:84,y2:112},1)).toBe(5));
 it('formats feet and inches',()=>expect(formatLength(2.5)).toBe("2′ 6″"));
});
