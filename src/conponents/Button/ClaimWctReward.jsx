import { ethers } from 'ethers'
import * as React from 'react'
import { getAccount } from '@wagmi/core'
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  chainId,
  chain,
  useAccount,
} from 'wagmi'

import worldcup_dis_abi from '../../abi/WorldCupDistributor.json'
import {getClaimWctToeknInfo} from "../../logic/distributeTokenLogic"
import { Button, Divider, Input, List, Typography } from 'antd'
import { executeQuery } from '../../utils/others'

export function ClaimWctReward() {


  const[claimWctInfo,setClaimWctInfo]= React.useState([])

  const { config } = usePrepareContractWrite({
    addressOrName: '0xe49f175a25046bB3caB9b745583f8c6900CEb4B5',
    contractInterface: worldcup_dis_abi.abi,
    functionName: 'claim',
    args:claimWctInfo
  })
  
  const { write, data } = useContractWrite(config)
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const [value, setValue] = React.useState()

  const { address, isConnecting, isConnected,isReconnecting } = useAccount()
  React.useEffect(()=> {
    async function go(){
      const res=await getClaimWctToeknInfo(value,address).then().catch((res)=>{
        setClaimWctInfo(res)
      })
      console.log("claimWCtInfo-----")
      console.log(res)
      setClaimWctInfo(res)

      fetchPlayerClaimHis()


    }
    
    go()
     
  },[value,address])

   const [wctclaimHistories,SetWctclaimHistories] =React.useState("")
  async function fetchPlayerClaimHis(){
      const query=
      `{
        wctclaimHistories(where: {player: "${address}"}) {
          id
          player
          totalAmt
          index
        }
      }
      `
    const res=  await  executeQuery(query)
    SetWctclaimHistories(res['data']['wctclaimHistories'])
  }



  const changeValue = (e) => {
    setValue(e.target.value)
  }

   
  const position="bottom"
  const align="end"
  return (
    <div>
      <Divider orientation="left">用户领取激励Token（WCT） </Divider>
      <List
          pagination={{
            position,
            align,
          }}
          header={<div>当前用户领取WCT历史(Todo)</div>}
          footer={<div>
                    <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 16px' }}>
                        <Input type='number' min={"0"} style={{ flex: 1 ,marginRight:10}} onChange={changeValue} placeholder="输入领取期数" />
                        <Button
                          type="primary"
                          shape="round"
                          disabled={!write || isLoading}
                          onClick={async () => {
                            write()
                          }
                          }
                        >
                          {isLoading ? '领取WCT激励...' : '领取WCT激励'}
                        </Button>
                    </div>
                    {isSuccess && (
                      <div style={{ color: '#fff' }}>
                        Successfully Played !
                        <div>
                          <a href={`https://goerli.etherscan.io/tx/${data?.hash}`}>
                            在Etherscan查看领取奖励
                          </a>
                        </div>
                      </div>
                    )}
                </div>}
          bordered
          dataSource={wctclaimHistories}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text strong>第{item.index}期获得激励Token：【{item.totalAmt}】</Typography.Text> 
            </List.Item>
          )}
        />



    </div>
  )
}
