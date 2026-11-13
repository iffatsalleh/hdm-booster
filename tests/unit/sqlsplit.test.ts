import { describe, it, expect } from 'vitest';
import { splitSql } from '../../scripts/sqlsplit.mjs';

describe('splitSql', () => {
  it('splits on top-level semicolons', () => {
    expect(splitSql('select 1; select 2;')).toEqual(['select 1', 'select 2']);
  });
  it('ignores semicolons inside quotes', () => {
    expect(splitSql("select ';'; select 2")).toEqual(["select ';'", 'select 2']);
    expect(splitSql('select ";" ; select 2')).toEqual(['select ";"', 'select 2']);
  });
  it('ignores semicolons inside dollar-quoted blocks', () => {
    expect(
      splitSql('create function f() returns int language plpgsql as $$ begin return 1; end; $$; select 3'),
    ).toEqual(['create function f() returns int language plpgsql as $$ begin return 1; end; $$', 'select 3']);
    expect(splitSql('do $body$ begin perform 1; end $body$;')).toHaveLength(1);
  });
  it('ignores semicolons inside comments', () => {
    expect(splitSql('-- a;b\nselect 1 /* x; y */;')).toEqual(['-- a;b\nselect 1 /* x; y */']);
  });
  it('drops empties', () => {
    expect(splitSql(' ; ;\n')).toEqual([]);
  });
});
