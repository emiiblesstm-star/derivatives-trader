import React from 'react';
import classNames from 'classnames';

import { Loading } from '@deriv/components';
import {
    hasContractEntered,
    isAccumulatorContract,
    isMultiplierContract,
    isOpen,
    isValidToCancel,
    isValidToSell,
    TContractStore,
    WS,
} from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';

import CardWrapper from 'AppV2/Components/CardWrapper';
import { ContractCard } from 'AppV2/Components/ContractCard';
import ContractDetailsFooter from 'AppV2/Components/ContractDetailsFooter';
import ContractDetailsHeader from 'AppV2/Components/ContractDetailsHeader';
import DealCancellation from 'AppV2/Components/DealCancellation/deal-cancellation';
import EntryExitDetails from 'AppV2/Components/EntryExitDetails';
import OrderDetails from 'AppV2/Components/OrderDetails';
import PayoutInfo from 'AppV2/Components/PayoutInfo';
import StopLoss from 'AppV2/Components/StopLoss/stop-loss';
import TakeProfit from 'AppV2/Components/TakeProfit/take-profit';
import TakeProfitHistory from 'AppV2/Components/TakeProfitHistory';
import useContractDetails from 'AppV2/Hooks/useContractDetails';
import { getContractDetailsConfig } from 'AppV2/Utils/contract-details-config';

import ContractDetailsChart from '../Chart/contract-details-chart';

const ContractDetails = observer(() => {
    const { contract_info, is_loading } = useContractDetails();
    const { contract_id, currency, contract_type, limit_order } = contract_info;
    const { take_profit, stop_loss } = limit_order ?? { take_profit: {}, stop_loss: {} };
    const [update_history, setUpdateHistory] = React.useState<TContractUpdateHistory>([]);
    const { common } = useStore();
    const { server_time } = common;
    const { isTakeProfitVisible, isStopLossVisible } = getContractDetailsConfig(contract_type ?? '');
    const canSell = isValidToSell(contract_info);
    type TContractUpdateHistory = TContractStore['contract_update_history'];
    type TResponse = {
        contract_update_history: TContractUpdateHistory;
    };

    const getSortedUpdateHistory = (history: TContractUpdateHistory) =>
        history.sort((a, b) => Number(b?.order_date) - Number(a?.order_date));
    const requestUpdatedHistory = React.useCallback((id?: number) => {
        if (!id) return;
        WS.contractUpdateHistory(id)
            .then((response: TResponse) => {
                setUpdateHistory(getSortedUpdateHistory(response.contract_update_history));
            })
            .catch(() => null);
    }, []);

    React.useEffect(() => {
        requestUpdatedHistory(contract_id);
    }, [contract_id, take_profit?.order_amount, stop_loss?.order_amount, requestUpdatedHistory]);

    if (is_loading) return <Loading.DTraderV2 is_contract_details />;

    const isMultiplier = isMultiplierContract(contract_info.contract_type);

    const canCancel = isValidToCancel(contract_info);
    const shouldShowSell = hasContractEntered(contract_info) && isOpen(contract_info);
    const { isTpHistoryVisible, isDealCancellationVisible } = getContractDetailsConfig(
        contract_info.contract_type ?? ''
    );
    const showCancelButton = isMultiplier && canCancel;
    let showRiskManagement =
        isOpen(contract_info) && (isTakeProfitVisible || isStopLossVisible) && (canSell || isDealCancellationVisible);

    if (isAccumulatorContract(contract_info.contract_type)) {
        showRiskManagement = isOpen(contract_info) && Boolean(limit_order);
    }
    return (
        <>
            <ContractDetailsHeader />
            <div
                className={classNames('contract-details', {
                    'contract-details--two-buttons': shouldShowSell && showCancelButton,
                    'contract-details--one-button': shouldShowSell && !showCancelButton,
                })}
            >
                <ContractCard contractInfo={contract_info} serverTime={server_time} currency={currency} />
                <ContractDetailsChart />
                <DealCancellation />
                {showRiskManagement && (
                    <CardWrapper>
                        <TakeProfit />
                        <StopLoss />
                    </CardWrapper>
                )}
                <OrderDetails contract_info={contract_info} />
                <PayoutInfo contract_info={contract_info} />
                <EntryExitDetails contract_info={contract_info} />
                {isTpHistoryVisible && update_history.length > 0 && (
                    <TakeProfitHistory history={update_history} currency={currency} is_multiplier={isMultiplier} />
                )}
            </div>
            {shouldShowSell && <ContractDetailsFooter contract_info={contract_info} />}
        </>
    );
});

export default ContractDetails;
