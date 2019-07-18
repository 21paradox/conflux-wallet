import React, { Component } from 'react'
import styles from './style.module.scss'
import Hidden from '@material-ui/core/Hidden'
import LockWallet from './lock-wallet/index'
// import DeployBtn from './deploy-btn/index'
import RefreshBtn from './refresh-btn/index'
import NetSelect from './net-select/index'
import LangSelect from './lang-select/index'
import MobileMenu from './mobile-menu/index'

interface IProps {
  isLogin: boolean
  lockStatus?: boolean
  lockError?: boolean
  lockAction?: (val) => void
  refreshAction?: (callback, errCallback) => void
}
class OperateList extends Component<IProps> {
  static defaultProps = { isLogin: false, lockStatus: true }
  refreshBtnCallback = () => {
    // TODO: success callback
  }
  refreshBtnErrCallback = () => {
    // TODO: err callback
  }
  render() {
    const { isLogin, lockStatus, lockError } = this.props

    return (
      <div className={styles.operateWrap}>
        <LockWallet
          isLogin={isLogin}
          lockStatus={lockStatus}
          lockError={lockError}
          lockAction={this.props.lockAction}
        />
        {/* 大屏 */}
        <Hidden xsDown>
          <div className={styles.operateListPc}>
            {/* <DeployBtn isLogin={isLogin}  lockStatus={lockStatus}/> */}
            <RefreshBtn
              isLogin={isLogin}
              lockStatus={lockStatus}
              refreshAction={() => {
                this.props.refreshAction(this.refreshBtnCallback, this.refreshBtnErrCallback)
              }}
            />
            <NetSelect lockStatus={lockStatus} />
            <LangSelect lockStatus={lockStatus} />
          </div>
        </Hidden>
        {/* 移动屏 */}
        <Hidden smUp>
          <div className={styles.operateListM}>
            {isLogin ? (
              <MobileMenu lockStatus={lockStatus} isLogin={isLogin} />
            ) : (
              <NetSelect lockStatus={lockStatus} />
            )}
            <LangSelect lockStatus={lockStatus} />
          </div>
        </Hidden>
      </div>
    )
  }
}
export default OperateList
