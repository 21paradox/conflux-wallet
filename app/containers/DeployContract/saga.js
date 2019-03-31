import lightwallet from 'eth-lightwallet';
import BigNumber from 'bignumber.js';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { makeSelectKeystore, makeSelectPassword } from 'containers/HomePage/selectors';
import { Gwei, maxGasLimitForDeployContract } from 'utils/constants';
import { makeSelectCode, makeSelectFrom, makeSelectGasPrice } from './selectors';
import {
  confirmDeployContractSuccess,
  confirmDeployContractError,
  deploySuccess,
  deployError,
  deployInProgress,
} from './actions';
import { COMFIRM_DEPLOY_CONTRACT, DEPLOY_CONTRACT } from './constants';
import web3 from '../Header/web3';
const txutils = lightwallet.txutils;
const signing = lightwallet.signing;

export function* confirmSendTransaction() {
  try {
    const fromAddress = yield select(makeSelectFrom());
    const code = yield select(makeSelectCode());
    // const gasPrice = yield select(makeSelectGasPrice());

    if (!web3.isAddress(fromAddress)) {
      throw new Error('Source address invalid');
    }

    if (!code) {
      throw new Error('code invalid');
    }
    // TODO:提示语
    const msg = `you can continue deploy contract`;
    yield put(confirmDeployContractSuccess(msg));
  } catch (err) {
    // const errorString = `confirmSendTransaction error - ${err.message}`;
    yield put(confirmDeployContractError(err.message));
  }
}

export function* DeployContract() {
  const keystore = yield select(makeSelectKeystore());
  const origProvider = keystore.passwordProvider;
  try {
    const fromAddress = yield select(makeSelectFrom());
    const code = yield select(makeSelectCode());
    // const gas = yield select(makeSelectGas());
    const gasPrice = new BigNumber(yield select(makeSelectGasPrice())).times(Gwei).toNumber();
    const password = yield select(makeSelectPassword());

    if (!password) {
      throw new Error('No password found - please unlock wallet before send');
    }
    if (!keystore) {
      throw new Error('No keystore found - please create wallet');
    }
    //  开始部署
    yield put(deployInProgress(true));

    keystore.passwordProvider = (callback) => {
      // we cannot use selector inside this callback so we use a const value
      const ksPassword = password;
      callback(null, ksPassword);
    };

    // eslint-disable-next-line no-inner-declarations
    function getNoncePromise(addr) {
      // 获取最新的 nonce
      return new Promise((resolve, reject) => {
        web3.cfx.getTransactionCount(addr, (err, data) => {
          if (err !== null) return reject(err);
          return resolve(data);
        });
      });
    }

    //  这个 nonce 应该在第一次获取后缓存起来，以后每次交易 +1
    // 在发出一笔tx之后，从fullnode接受它到执行它会有延迟，大概一分钟左右。
    // 这个期间内，如果用户又发出了一笔交易的话，使用getTransactionCount作为nonce是不对的。
    let nonce = yield call(getNoncePromise, fromAddress);
    console.log(nonce);
    const localNonce = Number(localStorage.getItem(fromAddress)) || 0;
    // getTransactionCount的nonce如果比 localStorage 里面的小，就用 localStorage 里面的，nonce用完一次就 +1
    if (localNonce > nonce) {
      nonce = localNonce;
    }
    localStorage.setItem(fromAddress, nonce + 1);
    console.log('nonce: ', nonce);

    const sendParams = {
      gasPrice,
      gasLimit: maxGasLimitForDeployContract,
      value: 0,
      data: code,
      nonce,
    };

    // eslint-disable-next-line no-inner-declarations
    function keyFromPasswordPromise(param) {
      return new Promise((resolve, reject) => {
        keystore.keyFromPassword(param, (err, data) => {
          if (err !== null) return reject(err);
          return resolve(data);
        });
      });
    }

    const pwDerivedKey = yield call(keyFromPasswordPromise, password);

    // 使用 eth-lightwallet 的方法来签名交易
    const contractData = txutils.createContractTx(fromAddress, sendParams);
    const signedTx = signing.signTx(keystore, pwDerivedKey, contractData.tx, fromAddress);

    console.log(`Signed Contract creation TX: ${signedTx}`);
    console.log(`Contract Address: ${contractData.addr}`);

    // eslint-disable-next-line no-inner-declarations
    function sendRawTransactionPromise(params) {
      // 发送签名后的交易
      return new Promise((resolve, reject) => {
        web3.cfx.sendRawTransaction(params, function(err, hash) {
          if (err != null) return reject(err);
          return resolve(hash);
        });
      });
    }

    // 获取交易的 tx
    const tx = yield call(sendRawTransactionPromise, `0x${signedTx}`);

    // 搞定了
    console.log('Contract Deploy Success，TxHash is: ', tx);

    //  tx获取成功后，显示出来
    yield put(deploySuccess(tx));
  } catch (err) {
    console.error(err);
    const loc = err.message.indexOf('at runCall');
    const errMsg = loc > -1 ? err.message.slice(0, loc) : err.message;
    yield put(deployError(errMsg));
  } finally {
    keystore.passwordProvider = origProvider;
  }
}

export default function* defaultSaga() {
  yield takeLatest(COMFIRM_DEPLOY_CONTRACT, confirmSendTransaction);
  yield takeLatest(DEPLOY_CONTRACT, DeployContract);
}