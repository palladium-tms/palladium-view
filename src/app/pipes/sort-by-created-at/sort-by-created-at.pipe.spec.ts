import { SortByCreatedAtPipe } from './sort-by-created-at.pipe';

describe('SortByCreatedAtPipe', () => {
  it('create an instance', () => {
    const pipe = new SortByCreatedAtPipe();
    expect(pipe).toBeTruthy();
  });
});
