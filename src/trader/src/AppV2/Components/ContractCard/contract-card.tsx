import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import clsx from 'clsx';

import { IconTradeTypes, Money, RemainingTime } from '@deriv/components';
import {
    formatDate,
    formatTime,
    getCardLabels,
    getCurrentTick,
    getMarketName,
    getStartTime,
    getTradeTypeName,
    isCryptoContract,
    isEnded,
    isMultiplierContract,
    isValidToCancel,
    isValidToSell,
    TContractInfo,
    toMoment,
} from '@deriv/shared';
import { isHigherLowerContractInfo } from '@deriv/shared/src/utils/helpers/market-underlying';
import { CaptionText, Tag, Text } from '@deriv-com/quill-ui';

import { TClosedPosition } from 'AppV2/Containers/Positions/positions-content';
import { getProfit } from 'AppV2/Utils/positions-utils';
import { TRootStore } from 'Types';

import { ContractCardStatusTimer, TContractCardStatusTimerProps } from './contract-card-status-timer';

type TContractCardProps = TContractCardStatusTimerProps & {
    className?: string;
    contractInfo: TContractInfo | TClosedPosition['contract_info'];
    currency?: string;
    hasActionButtons?: boolean;
    isSellRequested?: boolean;
    onClick?: (e?: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>) => void;
    onCancel?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    onClose?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    redirectTo?: string | React.ComponentProps<typeof NavLink>['to'];
    serverTime?: TRootStore['common']['server_time'];
};

const DIRECTION = {
    LEFT: 'left',
    RIGHT: 'right',
};

const swipeConfig = {
    trackMouse: true,
    preventScrollOnSwipe: true,
};

const ContractCard = ({
    className = 'contract-card',
    contractInfo,
    currency,
    hasActionButtons,
    isSellRequested,
    onCancel,
    onClick,
    onClose,
    redirectTo,
    serverTime,
}: TContractCardProps) => {
    const [isDeleted, setIsDeleted] = React.useState(false);
    const [isClosing, setIsClosing] = React.useState(false);
    const [isCanceling, setIsCanceling] = React.useState(false);
    const [shouldShowButtons, setShouldShowButtons] = React.useState(false);
    const { buy_price, contract_type, display_name, purchase_time, sell_time, shortcode, limit_order } =
        contractInfo as TContractInfo;
    const { take_profit, stop_loss } = limit_order ?? { take_profit: {}, stop_loss: {} };
    const is_higher_lower = isHigherLowerContractInfo({
        contract_category: (contractInfo as any).contract_category,
        shortcode,
    });
    const contract_main_title = getTradeTypeName(contract_type ?? '', {
        isHighLow: is_higher_lower,
        showMainTitle: true,
    });
    const cancellation_date_expiry = 'cancellation' in contractInfo ? contractInfo.cancellation?.date_expiry : null;
    const currentTick = 'tick_count' in contractInfo && contractInfo.tick_count ? getCurrentTick(contractInfo) : null;
    const tradeTypeName = `${contract_main_title} ${getTradeTypeName(contract_type ?? '', {
        isHighLow: is_higher_lower,
    })}`.trim();
    const symbol = (contractInfo as any).underlying_symbol || (contractInfo as any).symbol;
    const symbolName = symbol ? getMarketName(symbol) : display_name;
    const is_crypto = isCryptoContract((contractInfo as TContractInfo).underlying);
    const isMultiplier = isMultiplierContract(contract_type);
    const isSold = !!sell_time || isEnded(contractInfo as TContractInfo);
    const totalProfit = getProfit(contractInfo);
    const validToCancel = isValidToCancel(contractInfo as TContractInfo);
    const validToSell = isValidToSell(contractInfo as TContractInfo) && !isSellRequested;
    const isCancelButtonPressed = isSellRequested && isCanceling;
    const isCloseButtonPressed = isSellRequested && isClosing;
    const has_no_auto_expiry = isMultiplier && !is_crypto;
    const show_status_timer_tag = !has_no_auto_expiry || (has_no_auto_expiry && isSold);
    const Component = redirectTo ? NavLink : 'div';

    const handleSwipe = (direction: string) => {
        const isLeft = direction === DIRECTION.LEFT;
        setShouldShowButtons(isLeft);
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => handleSwipe(DIRECTION.LEFT),
        onSwipedRight: () => handleSwipe(DIRECTION.RIGHT),
        ...swipeConfig,
    });

    const handleClose = (e: React.MouseEvent<HTMLButtonElement>, shouldCancel?: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        if (shouldCancel) {
            onCancel?.(e);
            setIsCanceling(true);
        } else {
            onClose?.(e);
            setIsClosing(true);
        }
    };

    const getRiskManagementLabels = () => {
        const labels: string[] = [];
        if (take_profit?.order_amount) labels.push('TP');
        if (stop_loss?.order_amount) labels.push('SL');
        if (validToCancel) labels.push('DC');
        return labels;
    };
    const risk_management_labels = getRiskManagementLabels();
    const show_risk_management_labels = !!risk_management_labels.length && !isSold;

    React.useEffect(() => {
        if (isSold && hasActionButtons) {
            setIsDeleted(true);
        }
    }, [isSold, hasActionButtons]);

    if (!contract_type) return null;
    return (
        <div className={clsx(`${className}-wrapper`, { deleted: isDeleted })}>
            <Component
                {...(hasActionButtons ? swipeHandlers : {})}
                className={clsx(className, {
                    'show-buttons': shouldShowButtons,
                    'has-cancel-button': validToCancel,
                    lost: Number(totalProfit) < 0,
                    won: Number(totalProfit) >= 0,
                })}
                onClick={onClick}
                onDragStart={e => e.preventDefault()}
                to={redirectTo}
            >
                <div className={`${className}__body`}>
                    <div className={`${className}__details`}>
                        <IconTradeTypes type={is_higher_lower ? `${contract_type}_barrier` : contract_type} size={16} />
                        <div className='tag__wrapper'>
                            {show_risk_management_labels &&
                                risk_management_labels.map(label => (
                                    <Tag
                                        className='risk-management'
                                        label={label}
                                        key={label}
                                        variant='custom'
                                        size='sm'
                                    />
                                ))}
                            {show_status_timer_tag && (
                                <ContractCardStatusTimer
                                    currentTick={currentTick}
                                    isSold={isSold}
                                    serverTime={serverTime}
                                    {...contractInfo}
                                />
                            )}
                        </div>
                    </div>
                    <div className={`${className}__details`}>
                        <Text className='trade-type' size='sm'>
                            {tradeTypeName}
                        </Text>
                        <Text size='sm' color='quill-typography__color--subtle'>
                            <Money amount={buy_price} currency={currency} show_currency />
                        </Text>
                    </div>
                    <div className={`${className}__details`}>
                        <Text size='sm' className='symbol' color='quill-typography__color--subtle'>
                            {symbolName}
                        </Text>
                        <Text className='profit' size='sm'>
                            <Money amount={totalProfit} currency={currency} has_sign show_currency />
                        </Text>
                    </div>
                </div>
                {hasActionButtons && (
                    <div className='buttons'>
                        {validToCancel && (
                            <button
                                className={clsx({ loading: isCancelButtonPressed })}
                                disabled={Number((contractInfo as TContractInfo).profit) >= 0 || isSellRequested}
                                onClick={e => handleClose(e, true)}
                            >
                                {isCancelButtonPressed ? (
                                    <div className='circle-loader' data-testid='dt_button_loader' />
                                ) : (
                                    <>
                                        <CaptionText
                                            bold
                                            as='div'
                                            className='label'
                                            color='quill-typography__color--prominent'
                                        >
                                            {getCardLabels().CANCEL}
                                        </CaptionText>
                                        {cancellation_date_expiry && (
                                            <CaptionText
                                                bold
                                                as='div'
                                                className='label'
                                                color='quill-typography__color--prominent'
                                            >
                                                <RemainingTime
                                                    end_time={cancellation_date_expiry}
                                                    format='mm:ss'
                                                    getCardLabels={getCardLabels}
                                                    start_time={serverTime as moment.Moment}
                                                />
                                            </CaptionText>
                                        )}
                                    </>
                                )}
                            </button>
                        )}
                        <button
                            className={clsx({ loading: isCloseButtonPressed })}
                            disabled={!validToSell}
                            onClick={handleClose}
                        >
                            {isCloseButtonPressed ? (
                                <div className='circle-loader' data-testid='dt_button_loader' />
                            ) : (
                                <CaptionText
                                    bold
                                    as='div'
                                    className='label'
                                    color='var(--component-textIcon-static-prominentDark)'
                                >
                                    {getCardLabels().CLOSE}
                                </CaptionText>
                            )}
                        </button>
                    </div>
                )}
            </Component>
        </div>
    );
};

export default ContractCard;
