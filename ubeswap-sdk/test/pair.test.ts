import { CELO as _CGLD, ChainId, USDT as _cUSD, Pair, Price, Token, TokenAmount } from '../src'

describe('Pair', () => {
  const USDT = new Token(ChainId.BaseMainnet, _cUSD[ChainId.BaseMainnet].address, 18, 'USDT', 'Celo USD')
  const CGLD = new Token(ChainId.BaseMainnet, _CGLD[ChainId.BaseMainnet].address, 18, 'CGLD', 'Celo')

  describe('constructor', () => {
    it('cannot be used for tokens on different chains', () => {
      expect(() => new Pair(new TokenAmount(USDT, '100'), new TokenAmount(_CGLD[ChainId.BaseGoerli], '100'))).toThrow(
        'CHAIN_IDS'
      )
    })
  })

  describe('#getAddress', () => {
    it('returns the correct address', () => {
      expect(Pair.getAddress(USDT, CGLD)).toEqual('0x1E593F1FE7B61c53874B54EC0c59FD0d5eb8621e')
    })
  })

  describe('#token0', () => {
    it('always is the token that sorts before', () => {
      expect(new Pair(new TokenAmount(USDT, '100'), new TokenAmount(CGLD, '100')).token0).toEqual(CGLD)
      expect(new Pair(new TokenAmount(CGLD, '100'), new TokenAmount(USDT, '100')).token0).toEqual(CGLD)
    })
  })
  describe('#token1', () => {
    it('always is the token that sorts after', () => {
      expect(new Pair(new TokenAmount(USDT, '100'), new TokenAmount(CGLD, '100')).token1).toEqual(USDT)
      expect(new Pair(new TokenAmount(CGLD, '100'), new TokenAmount(USDT, '100')).token1).toEqual(USDT)
    })
  })
  describe('#reserve0', () => {
    it('always comes from the token that sorts before', () => {
      expect(new Pair(new TokenAmount(USDT, '100'), new TokenAmount(CGLD, '101')).reserve0).toEqual(
        new TokenAmount(CGLD, '101')
      )
      expect(new Pair(new TokenAmount(CGLD, '101'), new TokenAmount(USDT, '100')).reserve0).toEqual(
        new TokenAmount(CGLD, '101')
      )
    })
  })
  describe('#reserve1', () => {
    it('always comes from the token that sorts after', () => {
      expect(new Pair(new TokenAmount(USDT, '100'), new TokenAmount(CGLD, '101')).reserve1).toEqual(
        new TokenAmount(USDT, '100')
      )
      expect(new Pair(new TokenAmount(CGLD, '101'), new TokenAmount(USDT, '100')).reserve1).toEqual(
        new TokenAmount(USDT, '100')
      )
    })
  })

  describe('#token0Price', () => {
    it('returns price of token0 in terms of token1', () => {
      expect(new Pair(new TokenAmount(USDT, '101'), new TokenAmount(CGLD, '100')).token0Price).toEqual(
        new Price(CGLD, USDT, '100', '101')
      )
      expect(new Pair(new TokenAmount(CGLD, '100'), new TokenAmount(USDT, '101')).token0Price).toEqual(
        new Price(CGLD, USDT, '100', '101')
      )
    })
  })

  describe('#token1Price', () => {
    it('returns price of token1 in terms of token0', () => {
      expect(new Pair(new TokenAmount(USDT, '101'), new TokenAmount(CGLD, '100')).token1Price).toEqual(
        new Price(USDT, CGLD, '101', '100')
      )
      expect(new Pair(new TokenAmount(CGLD, '100'), new TokenAmount(USDT, '101')).token1Price).toEqual(
        new Price(USDT, CGLD, '101', '100')
      )
    })
  })

  describe('#priceOf', () => {
    const pair = new Pair(new TokenAmount(USDT, '101'), new TokenAmount(CGLD, '100'))
    it('returns price of token in terms of other token', () => {
      expect(pair.priceOf(CGLD)).toEqual(pair.token0Price)
      expect(pair.priceOf(USDT)).toEqual(pair.token1Price)
    })

    it('throws if invalid token', () => {
      expect(() => pair.priceOf(_CGLD[ChainId.BaseGoerli])).toThrow('TOKEN')
    })
  })

  describe('#reserveOf', () => {
    it('returns reserves of the given token', () => {
      expect(new Pair(new TokenAmount(USDT, '100'), new TokenAmount(CGLD, '101')).reserveOf(USDT)).toEqual(
        new TokenAmount(USDT, '100')
      )
      expect(new Pair(new TokenAmount(CGLD, '101'), new TokenAmount(USDT, '100')).reserveOf(USDT)).toEqual(
        new TokenAmount(USDT, '100')
      )
    })

    it('throws if not in the pair', () => {
      expect(() =>
        new Pair(new TokenAmount(CGLD, '101'), new TokenAmount(USDT, '100')).reserveOf(_CGLD[ChainId.BaseGoerli])
      ).toThrow('TOKEN')
    })
  })

  describe('#chainId', () => {
    it('returns the token0 chainId', () => {
      expect(new Pair(new TokenAmount(USDT, '100'), new TokenAmount(CGLD, '100')).chainId).toEqual(ChainId.BaseMainnet)
      expect(new Pair(new TokenAmount(CGLD, '100'), new TokenAmount(USDT, '100')).chainId).toEqual(ChainId.BaseMainnet)
    })
  })
  describe('#involvesToken', () => {
    expect(new Pair(new TokenAmount(USDT, '100'), new TokenAmount(CGLD, '100')).involvesToken(USDT)).toEqual(true)
    expect(new Pair(new TokenAmount(USDT, '100'), new TokenAmount(CGLD, '100')).involvesToken(CGLD)).toEqual(true)
    expect(
      new Pair(new TokenAmount(USDT, '100'), new TokenAmount(CGLD, '100')).involvesToken(_CGLD[ChainId.BaseGoerli])
    ).toEqual(false)
  })
})
