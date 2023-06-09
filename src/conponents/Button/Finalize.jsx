import { ethers } from 'ethers'
import * as React from 'react'
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  chainId,
  chain,
  useAccount,
} from 'wagmi'
import worldcup_abi from '../../abi/WorldCup.json'
import { Input, Button, Divider, List, Typography } from 'antd'
import {executeQuery} from '../../utils/others'
import { useState } from 'react'
import { useEffect } from 'react'
import { DistributeToken } from './DistributeToken'




export function Finalize() {

  const [finHis,setfinHis]=useState([{}])
  
  function  fetchFinalizeHistoies(){
    const query=`{
      finializeHistories(orderDirection: desc) {
        id
        result
      }
    }`
     const res=executeQuery(query).then(item=>{
      setfinHis(item.data.finializeHistories)
     })
     return res
  }
  

  const [value, setValue] = React.useState('')
  const { config } = usePrepareContractWrite({
    addressOrName: '0x6F38116237d73237810894c0dbc9d7c786E2EeBd',
    contractInterface: worldcup_abi.abi,
    functionName: 'finialize',
    args: [value],
  })

  const { write, data } = useContractWrite(config)
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const changeValue = (e) => {
    setValue(e.target.value)
  }

  useEffect(()=>{
    fetchFinalizeHistoies()
  },[])
  const position="bottom"
  const align="end"
  return (
    <div>
      <Divider orientation="left">管理员开奖 </Divider>
      <List
          pagination={{
            position,
            align,
          }}
          header={<div>历史开奖</div>}
          footer={
          <div>
              <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 16px' }}>
                <Input style={{ flex: 1 ,marginRight:10}} onChange={changeValue} placeholder="country code: 0 ~ 4" />
                <Button
                type="primary"
                shape="round"
                disabled={!write || isLoading}
                onClick={() => write()}
              >
                {isLoading ? 'Finalize...' : 'Finalize'}
              </Button>
              </div>
              {isSuccess && (
                <div>
                <a
                  target="_blank"
                  href={`https://mumbai.polygonscan.com/tx/${data?.hash}`}
                  rel="noreferrer"
                >
                  交易成功！在polygonscan上查看
                </a>
              </div>
              )}
          </div>
        }
          bordered
          dataSource={finHis}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text strong>第{item.id}期编号：【{item.result}】</Typography.Text> 
            </List.Item>
          )}
        />

        <DistributeToken></DistributeToken>
      

  
    </div>
  )
}
