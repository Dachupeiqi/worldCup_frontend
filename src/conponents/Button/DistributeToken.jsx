import { ethers } from 'ethers'
import * as React from 'react'
import { BigNumber } from 'bignumber.js'
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  chainId,
  chain,
  useAccount,
} from 'wagmi'
 
import worldcup_distri_abi from '../../abi/WorldCupDistributor.json'
import { Input, Button, Divider, List, Typography } from 'antd'
import {executeQuery} from '../../utils/others'
import { useState } from 'react'
import { useEffect } from 'react'
import {getDistributeInfo} from '../../logic/distributeTokenLogic'

import { fetchBlockNumber } from '@wagmi/core'

export function DistributeToken() {

  const [merkleDistributors,setMerkleDistributors]=useState([{}])
  
  function  fetchMerkleDistributors(){
    const query=
    `{
      merkleDistributors {
        index
        totalAmt
      }
    }`
     const res=executeQuery(query).then(item=>{
      setMerkleDistributors(item.data.merkleDistributors)
     })
      
     return res
  }


 const oneEther = new BigNumber(Math.pow(10, 18))

 const createBigNumber18 = (v) => {
  return new BigNumber(v).multipliedBy(oneEther).toFixed()
}

 
  const [distriAmount, setDistriAmount] = React.useState('')
  const [roundNum, setRoundNum] = React.useState('')
  const [merkleRoot, setMerkleRoot] = React.useState('')
  const [blockNum, setBlockNum] = React.useState(0)
  const changeValue = (e) => {
    setDistriAmount(createBigNumber18(e.target.value))
  }
  const changeValue2 = (e) => {
    setRoundNum(e.target.value)
  }


  React.useEffect(() => {
    fetchMerkleDistributors()
    setBlockNum(fetchBlockNumber())
    if (distriAmount !== ''&&roundNum !== '') {
      getDistributeInfo(roundNum, distriAmount).then(
        item => {
        if(item!=null){
          console.log("disTreeRoot")
         console.log(item.tree.getHexRoot()) 
          setMerkleRoot(item.tree.getHexRoot());
        } 
      });
    }
  
    
  }, [distriAmount,roundNum]);





  const { config } = usePrepareContractWrite({
    addressOrName: '0xA469B9D3E5bB02887325dE6ec527CA657e0C18b1',
    contractInterface: worldcup_distri_abi.abi,
    functionName: 'distributeReward',
    args: [roundNum,distriAmount,blockNum,merkleRoot],
  })

  const { write, data } = useContractWrite(config)
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })


  

  async function isFinial(currRound){
      const query=`{
        finializeHistory(id: "${currRound}", subgraphError: allow) {
          id
          result
        }
      }`
     
      const res=await executeQuery(query)
      if(res.data.finializeHistory===null){
        return false
      }else{
        return true
      }

       

  }
 
  const position="bottom"
  const align="end"

  return (
    <div>
      <Divider orientation="left">管理员分配激励WCT代币</Divider>
      <List
          pagination={{
            position,
            align,
          }}
          header={<div>激励历史</div>}
          footer={
            <div>
            <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 16px' }}>

              <Input type='number' min={"0"} style={{ flex: 1 ,marginRight:10}} onChange={changeValue} placeholder="输入激励的WCT数量" />
              <Input type='number' min={"0"} style={{ flex: 1 ,marginRight:10}} onChange={changeValue2} placeholder="输入期号" />
              <Button
              type="primary"
              shape="round"
              disabled={!write || isLoading}
              onClick={ async ()=>{
                
                const isFin=await isFinial(roundNum)
                console.log(isFin)
                if(!isFin){
                  alert(`第${roundNum}期还没开奖！！`)
                  return
                }
                setBlockNum(fetchBlockNumber()); 
                write()
              }
              }
               >
              {isLoading ? 'Distribute...' : 'Distribute'}
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
          dataSource={merkleDistributors}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text strong>第{item.index}期颁发奖励：【{item.totalAmt?ethers.utils.formatEther(item.totalAmt):""}】WCT</Typography.Text> 
            </List.Item>
          )}
        />



  
    </div>
  )
}
