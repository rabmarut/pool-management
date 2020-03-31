import fetch from 'isomorphic-fetch';
import { MarketAsset, MarketAssetPriceMap, StringMap } from '../types';
import { MarketAssetMap } from '../stores/Market';
import { bnum } from '../utils/helpers';

const MARKET_API_URL =
    process.env.MARKET_API_URL || 'https://api.nomics.com/v1';

const NOMICS_KEY = process.env.REACT_APP_NOMICS_API;

export async function fetchAssetPrices(
    symbolsToFetch: string[],
    assetData: MarketAssetMap,
    idToSymbolMap: StringMap
): Promise<MarketAssetPriceMap> {

    let idQueryString = '';
    symbolsToFetch.forEach((symbol, index) => {
        if (index === symbolsToFetch.length - 1) {
            idQueryString += `${assetData[symbol].id}`;
        } else {
            idQueryString += `${assetData[symbol].id},`;
        }
    });

    const query = `currencies/ticker?key=${NOMICS_KEY}&ids=${idQueryString}`;

    const response = await fetch(`${MARKET_API_URL}/${query}`, {
        headers: {
            Accept: 'application/json'
        },
    });

    const prices = await response.json();

    const priceMap: MarketAssetPriceMap = {};
    Object.keys(prices).forEach(key => {
        const price = prices[key].price;
        const symbol = idToSymbolMap[prices[key].id];

        // Nomics unable to price WETH so use ETH info
        if(symbol === 'ETH'){
          priceMap['WETH'] = {
              value: bnum(price),
              currency: 'usd',
          };
        }
        priceMap[symbol] = {
            value: bnum(price),
            currency: 'usd',
        };
    });

    return priceMap;
}

export async function fetchAssetList(
    symbolsToFetch: string[]
): Promise<MarketAssetMap> {
    let query = `currencies?key=${NOMICS_KEY}&attributes=id,original_symbol,name`;

    const response = await fetch(`${MARKET_API_URL}/${query}`, {
        headers: {
            Accept: 'application/json'
        },
    });

    const formatAsset = (asset): MarketAsset => {
        return {
            id: asset.id,
            name: asset.name,
            symbol: asset.original_symbol.toUpperCase(),
        } as MarketAsset;
    };

    // Only store assets that map to deployed.json approved assets
    // toUpperCase symbol, compare to symbols in list, store if match
    const assets = await response.json();

    const result: MarketAssetMap = {};
    symbolsToFetch.forEach(assetSymbol => {
        const match = assets.find(
            value => value.original_symbol.toUpperCase() === assetSymbol
        );
        if (match) {
            result[assetSymbol] = formatAsset(match);
        }
    });

    return result;
}
