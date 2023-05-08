import { ethers } from 'ethers'
import * as React from 'react'
import { getAccount } from '@wagmi/core'
 
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
  chainId,
  chain,
  useAccount,
} from 'wagmi'
import worldcup_abi from '../../abi/WorldCup.json'
import {getClaimWctToeknInfo} from "../../logic/distributeTokenLogic"
import { Button, Divider, Input, List, Typography } from 'antd'
import {executeQuery} from '../../utils/others'
import BigNumber from 'bignumber.js'
export function ClaimReward() {
  const { config } = usePrepareContractWrite({
    addressOrName: '0x6F38116237d73237810894c0dbc9d7c786E2EeBd',
    contractInterface: worldcup_abi.abi,
    functionName: 'claimReward',
  })
  
  const { write, data } = useContractWrite(config)
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const { address, isConnecting, isConnected,isReconnecting } = useAccount()
  const position="bottom"
  const align="end"

  React.useEffect(()=>{
    fetchCurrentUserPlayRecord(address)
  },[address,isReconnecting])

  const [playRecord,setPlayRecord]=React.useState([])
  function  fetchCurrentUserPlayRecord(add){
    const query=`{
      playRecords(where: {player: "${add}"}) {
        id
        index
        player
        selectCountry
        time
      }
    }`
      executeQuery(query).then(item=>{
      setPlayRecord(item.data.playRecords)
     })
     
  }

   function FetchWinWallet(){
     const{ data} =  useContractRead({
      addressOrName:'0x6F38116237d73237810894c0dbc9d7c786E2EeBd',
      contractInterface:worldcup_abi.abi,
      functionName: 'winnerVaults',
      args:[getAccount().address]
    })
     
    return(
      <Typography.Text strong>
         【{data?ethers.utils.formatEther(data):"0"}】ETH
      </Typography.Text>
    )  
  }



  return (
    <div>
      <Divider orientation="left">用户领取投票奖励（ETH） </Divider>
      <List
          pagination={{
            position,
            align,
          }}
          header={<div>当前用户投票历史</div>}
          footer={<div>
                    <div >
                        <Typography.Text strong >用户可领取投票奖励:{FetchWinWallet()}</Typography.Text> 
                        <br></br>
                        <Button
                          style={{marginTop:20}}
                          type="primary"
                          shape="round"
                          disabled={!write || isLoading}
                          onClick={() => write()}
                        >
                          {isLoading ? '领取投票奖励...' : '领取投票奖金'}
                        </Button>
                    </div>
                    {isSuccess && (
                      <div style={{ color: '#fff' }}>
                          <div>
                            <a
                              target="_blank"
                              href={`https://mumbai.polygonscan.com/tx/${data?.hash}`}
                              rel="noreferrer"
                            >
                              交易成功！在polygonscan上查看
                            </a>
                          </div>
                        
                      </div>
                    )}
                </div>}
          bordered
          dataSource={playRecord}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text strong>第{item.index}期投票：【{item.selectCountry}】</Typography.Text> 
            </List.Item>
          )}
        />












     
      
    </div>
  )
}
