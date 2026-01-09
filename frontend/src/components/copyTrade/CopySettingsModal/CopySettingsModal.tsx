import { X, AlertTriangle, Info, Check } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';



import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { useCopyTradeStore } from '@/store/copyTradeStore';
import { formatCompactUSD } from '@/utils/format';

import styles from './CopySettingsModal.module.scss';

import type { Trader, CopyTradeSettings } from '@/types';

interface CopySettingsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly trader: Trader;
  readonly isEditing?: boolean;
  readonly existingSettings?: CopyTradeSettings;
}

interface FormState {
  readonly maxPositionSize: string;
  readonly copyRatio: number;
  readonly stopLoss: string;
  readonly takeProfit: string;
  readonly maxDailyTrades: string;
}

// Default settings
const DEFAULT_SETTINGS: FormState = {
  maxPositionSize: '100',
  copyRatio: 50,
  stopLoss: '10',
  takeProfit: '50',
  maxDailyTrades: '10',
};

// Validation rules (pure functions)
const validatePositionSize = (value: string): string | null => {
  const num = parseFloat(value);
  if (Number.isNaN(num) || num <= 0) {return 'Must be greater than 0';}
  if (num > 10000) {return 'Maximum $10,000 per position';}
  return null;
};

const validateStopLoss = (value: string): string | null => {
  const num = parseFloat(value);
  if (Number.isNaN(num) || num <= 0) {return 'Must be greater than 0';}
  if (num > 100) {return 'Maximum 100%';}
  return null;
};

const validateTakeProfit = (value: string): string | null => {
  const num = parseFloat(value);
  if (Number.isNaN(num) || num <= 0) {return 'Must be greater than 0';}
  if (num > 1000) {return 'Maximum 1000%';}
  return null;
};

const validateDailyTrades = (value: string): string | null => {
  const num = parseInt(value, 10);
  if (Number.isNaN(num) || num <= 0) {return 'Must be at least 1';}
  if (num > 100) {return 'Maximum 100 trades per day';}
  return null;
};

export const CopySettingsModal = ({
  isOpen,
  onClose,
  trader,
  isEditing = false,
  existingSettings,
}: CopySettingsModalProps) => {
  const { followTrader, updateSettings, unfollowTrader, isLoading } = useCopyTradeStore();

  const [formState, setFormState] = useState<FormState>(DEFAULT_SETTINGS);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [step, setStep] = useState<'settings' | 'confirm' | 'success'>('settings');

  // Initialize form with existing settings
  useEffect(() => {
    if (existingSettings) {
      setFormState({
        maxPositionSize: existingSettings.maxPositionSize.toString(),
        copyRatio: existingSettings.copyRatio * 100,
        stopLoss: existingSettings.stopLoss.toString(),
        takeProfit: existingSettings.takeProfit.toString(),
        maxDailyTrades: existingSettings.maxDailyTrades.toString(),
      });
    }
  }, [existingSettings]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('settings');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    const positionError = validatePositionSize(formState.maxPositionSize);
    if (positionError) {newErrors.maxPositionSize = positionError;}

    const stopLossError = validateStopLoss(formState.stopLoss);
    if (stopLossError) {newErrors.stopLoss = stopLossError;}

    const takeProfitError = validateTakeProfit(formState.takeProfit);
    if (takeProfitError) {newErrors.takeProfit = takeProfitError;}

    const dailyTradesError = validateDailyTrades(formState.maxDailyTrades);
    if (dailyTradesError) {newErrors.maxDailyTrades = dailyTradesError;}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    formState.maxPositionSize,
    formState.stopLoss,
    formState.takeProfit,
    formState.maxDailyTrades,
  ]);

  const handleInputChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormState(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => {
          const { [field]: _, ...rest } = prev;
          return rest;
        });
      }
    };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({
      ...prev,
      copyRatio: parseInt(e.target.value, 10),
    }));
  };

  const handleContinue = () => {
    if (validateForm()) {
      setStep('confirm');
    }
  };

  const handleConfirm = async () => {
    const settings = {
      maxPositionSize: parseFloat(formState.maxPositionSize),
      copyRatio: formState.copyRatio / 100,
      stopLoss: parseFloat(formState.stopLoss),
      takeProfit: parseFloat(formState.takeProfit),
      maxDailyTrades: parseInt(formState.maxDailyTrades, 10),
    };

    try {
      if (isEditing) {
        await updateSettings(trader.id, settings);
      } else {
        await followTrader(trader.id, settings);
      }
      setStep('success');
    } catch {
      // Error is handled by store
    }
  };

  const handleStopCopying = async () => {
    try {
      await unfollowTrader(trader.id);
      onClose();
    } catch {
      // Error is handled by store
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onClose();
    } else if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) {return null;}

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {step === 'success'
              ? 'Success!'
              : isEditing
                ? 'Manage Copy Settings'
                : 'Copy Trade Settings'}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {step === 'settings' && (
            <>
              {/* Trader Info */}
              <div className={styles.traderInfo}>
                <img
                  src={trader.avatarUrl}
                  alt={trader.displayName}
                  className={styles.traderAvatar}
                  onError={e => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${trader.id}`;
                  }}
                />
                <div>
                  <span className={styles.traderName}>{trader.displayName}</span>
                  <span className={styles.traderStats}>
                    {trader.winRate.toFixed(0)}% win rate • {trader.totalTrades} trades
                  </span>
                </div>
              </div>

              {/* Form */}
              <div className={styles.form}>
                <div className={styles.field}>
                  <Input
                    label="Max Position Size (USD)"
                    type="number"
                    placeholder="100"
                    value={formState.maxPositionSize}
                    onChange={handleInputChange('maxPositionSize')}
                    {...(errors.maxPositionSize && { error: errors.maxPositionSize })}
                    leftIcon={<span className={styles.inputPrefix}>$</span>}
                  />
                  <span className={styles.fieldHint}>
                    Maximum amount to invest per copied trade
                  </span>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Copy Ratio: {formState.copyRatio}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={formState.copyRatio}
                    onChange={handleSliderChange}
                    className={styles.slider}
                  />
                  <div className={styles.sliderLabels}>
                    <span>10%</span>
                    <span>100%</span>
                  </div>
                  <span className={styles.fieldHint}>
                    Percentage of trader's position size to copy
                  </span>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <Input
                      label="Stop Loss (%)"
                      type="number"
                      placeholder="10"
                      value={formState.stopLoss}
                      onChange={handleInputChange('stopLoss')}
                      {...(errors.stopLoss && { error: errors.stopLoss })}
                      rightIcon={<span className={styles.inputSuffix}>%</span>}
                    />
                  </div>
                  <div className={styles.field}>
                    <Input
                      label="Take Profit (%)"
                      type="number"
                      placeholder="50"
                      value={formState.takeProfit}
                      onChange={handleInputChange('takeProfit')}
                      {...(errors.takeProfit && { error: errors.takeProfit })}
                      rightIcon={<span className={styles.inputSuffix}>%</span>}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <Input
                    label="Max Daily Trades"
                    type="number"
                    placeholder="10"
                    value={formState.maxDailyTrades}
                    onChange={handleInputChange('maxDailyTrades')}
                    {...(errors.maxDailyTrades && { error: errors.maxDailyTrades })}
                  />
                  <span className={styles.fieldHint}>Maximum number of trades to copy per day</span>
                </div>
              </div>

              {/* Risk Warning */}
              <div className={styles.warning}>
                <AlertTriangle size={18} />
                <p>
                  Copy trading involves significant risk. Past performance does not guarantee future
                  results. You may lose your entire investment.
                </p>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <div className={styles.confirmContent}>
              <div className={styles.confirmIcon}>
                <Info size={32} />
              </div>
              <h3 className={styles.confirmTitle}>Confirm Your Settings</h3>

              <div className={styles.confirmSummary}>
                <div className={styles.summaryRow}>
                  <span>Trader</span>
                  <span>{trader.displayName}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Max Position</span>
                  <span>{formatCompactUSD(parseFloat(formState.maxPositionSize))}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Copy Ratio</span>
                  <span>{formState.copyRatio}%</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Stop Loss</span>
                  <span>{formState.stopLoss}%</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Take Profit</span>
                  <span>{formState.takeProfit}%</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Max Daily Trades</span>
                  <span>{formState.maxDailyTrades}</span>
                </div>
              </div>

              <p className={styles.confirmDisclaimer}>
                By confirming, you agree that you understand the risks involved in copy trading and
                accept full responsibility for your investment decisions.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className={styles.successContent}>
              <div className={styles.successIcon}>
                <Check size={32} />
              </div>
              <h3 className={styles.successTitle}>
                {isEditing ? 'Settings Updated!' : 'Copy Trading Activated!'}
              </h3>
              <p className={styles.successText}>
                {isEditing
                  ? `Your copy settings for ${trader.displayName} have been updated.`
                  : `You are now copying ${trader.displayName}'s trades. You can manage or stop copying at any time.`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {step === 'settings' && (
            <>
              {isEditing && (
                <Button variant="danger" onClick={() => { void handleStopCopying(); }} isLoading={isLoading}>
                  Stop Copying
                </Button>
              )}
              <div className={styles.footerRight}>
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleContinue}>
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <Button variant="ghost" onClick={() => setStep('settings')}>
                Back
              </Button>
              <Button variant="primary" onClick={() => { void handleConfirm(); }} isLoading={isLoading}>
                {isEditing ? 'Save Changes' : 'Start Copying'}
              </Button>
            </>
          )}

          {step === 'success' && (
            <Button variant="primary" onClick={handleClose} fullWidth>
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
