import { createSelector } from 'reselect';

/**
 * Direct selector to the sendToken state domain
 */
const selectDeployContractDomain = (state) => state.get('deploycontract');
const makeSelectCode = () =>
  createSelector(
    selectDeployContractDomain,
    (substate) => substate.get('code')
  );

const makeSelectFrom = () =>
  createSelector(
    selectDeployContractDomain,
    (substate) => substate.get('from')
  );

const makeSelectGas = () =>
  createSelector(
    selectDeployContractDomain,
    (substate) => substate.get('gas')
  );

const makeSelectGasPrice = () =>
  createSelector(
    selectDeployContractDomain,
    (substate) => substate.get('gasPrice')
  );

const makeSelectComfirmationLoading = () =>
  createSelector(
    selectDeployContractDomain,
    (substate) => substate.get('comfirmationLoading')
  );

const makeSelectConfirmationError = () =>
  createSelector(
    selectDeployContractDomain,
    (substate) => substate.get('confirmationError')
  );

const makeSelectConfirmationMsg = () =>
  createSelector(
    selectDeployContractDomain,
    (substate) => substate.get('confirmationMsg')
  );

const makeSelectDeployInProgress = () =>
  createSelector(
    selectDeployContractDomain,
    (substate) => substate.get('deployInProgress')
  );

const makeSelectDeployError = () =>
  createSelector(
    selectDeployContractDomain,
    (substate) => substate.get('deployError')
  );

const makeSelectLocked = () =>
  createSelector(
    selectDeployContractDomain,
    (substate) => substate.get('locked')
  );

const makeSelectIsDeployComfirmationLocked = () =>
  createSelector(
    selectDeployContractDomain,
    (substate) =>
      substate.get('deployInProgress') !== false || substate.get('deploySuccess') !== false
  );

export {
  selectDeployContractDomain,
  makeSelectCode,
  makeSelectFrom,
  makeSelectGas,
  makeSelectGasPrice,
  makeSelectLocked,
  makeSelectComfirmationLoading,
  makeSelectConfirmationError,
  makeSelectConfirmationMsg,
  makeSelectIsDeployComfirmationLocked,
  makeSelectDeployInProgress,
  makeSelectDeployError,
};
