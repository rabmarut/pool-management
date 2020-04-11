// Stores
import ProviderStore from 'stores/Provider';
import BlockchainFetchStore from 'stores/BlockchainFetch';
import TokenStore from 'stores/Token';
import TransactionStore from './Transaction';
import PoolStore from './Pool';
import DropdownStore from './Dropdown';
import AppSettingsStore from './AppSettings';
import ContractMetadataStore from './ContractMetadata';
import MarketStore from './Market';
import AddLiquidityFormStore from './AddLiquidityForm';
import RemoveLiquidityFormStore from './RemoveLiquidityForm';

export default class RootStore {
    providerStore: ProviderStore;
    blockchainFetchStore: BlockchainFetchStore;
    tokenStore: TokenStore;
    poolStore: PoolStore;
    marketStore: MarketStore;
    transactionStore: TransactionStore;
    dropdownStore: DropdownStore;
    appSettingsStore: AppSettingsStore;
    contractMetadataStore: ContractMetadataStore;
    addLiquidityFormStore: AddLiquidityFormStore;
    removeLiquidityFormStore: RemoveLiquidityFormStore;

    constructor() {
        this.providerStore = new ProviderStore(this);
        this.blockchainFetchStore = new BlockchainFetchStore(this);
        this.tokenStore = new TokenStore(this);
        this.poolStore = new PoolStore(this);
        this.marketStore = new MarketStore(this);
        this.transactionStore = new TransactionStore(this);
        this.dropdownStore = new DropdownStore(this);
        this.appSettingsStore = new AppSettingsStore(this);
        this.contractMetadataStore = new ContractMetadataStore(this);
        this.addLiquidityFormStore = new AddLiquidityFormStore(this);
        this.removeLiquidityFormStore = new RemoveLiquidityFormStore(this);

        this.asyncSetup().catch(e => {
            //TODO: Add retry on these fetches
            throw new Error('Async Setup Failed ' + e);
        });
    }

    async asyncSetup() {
        // !!!!!!! Add web3 stuff here.
        await this.providerStore.loadWeb3();

        await this.marketStore.fetchAssetList(
            this.contractMetadataStore.tickerSymbols
        );
        await this.marketStore.fetchAssetPrices(
            this.contractMetadataStore.tickerSymbols
        );
    }
}
