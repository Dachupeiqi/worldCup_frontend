import { ethers } from 'ethers'
import moment from 'moment/moment';
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
import { Input, Button, Divider, List, Typography } from 'antd'
import { React, useState } from 'react'
import { useEffect } from 'react'
import {getContract} from '../../utils/contract'
// const App = () => <Input placeholder="Basic usage" />;

// export default App;

export function Play() {
  const [inputValue, setInputValue] = useState('0')

  const { 
    config ,
  } = usePrepareContractWrite({
    addressOrName: '0x6F38116237d73237810894c0dbc9d7c786E2EeBd',
    contractInterface: worldcup_abi.abi,
    functionName: 'play',
    args: [inputValue],
    overrides: {
      value: '1000000000', //这里要传递字符串
    },
  })

  const { write, data } = useContractWrite(config)
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const changeInput = (e) => {
    setInputValue(e.target.value)
  }

 
 
  function FetchCountry({num}){
     const { data} = useContractRead({
    addressOrName:'0x6F38116237d73237810894c0dbc9d7c786E2EeBd',
    contractInterface:worldcup_abi.abi,
    functionName: 'countries',
    args:[num]
  })
    return(
      <span>{data}</span>
    )
  }


  function FetchCurrentRoud(){
    const { data} = useContractRead({
   addressOrName:'0x6F38116237d73237810894c0dbc9d7c786E2EeBd',
   contractInterface:worldcup_abi.abi,
   functionName: 'currRound',
 })
   return(
     <span>{data}</span>
   )
 }

  



   const country0 = FetchCountry({ num: 0 })
   const country1 = FetchCountry({ num: 1 })
   const country2 = FetchCountry({ num: 2 })
   const country3 = FetchCountry({ num: 3 })
   const country4 = FetchCountry({ num: 4 })
   
  const countries=[
    country0,
    country1,
    country2,
    country3,
    country4
  ]
  const position="bottom"
  const align="end"

  return (
    <div>
      <Divider orientation="left">竞猜</Divider>
        <List
             pagination={{
              position,
              align,
            }}
          header={<div>本期球队列表:<Typography.Text strong>第{FetchCurrentRoud()}期</Typography.Text></div>}
          footer=
          {
          <div>
            <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 16px' }}>
              <Input style={{ flex: 1 ,marginRight:10}} onChange={changeInput} placeholder="country code: 0 ~ 4,once 1 gwei" />
                <Button
                type="primary"
                shape="round"
                //disabled={!write || isLoading}
                onClick={() => write()}
              >
                {isLoading ? 'Playing...' : 'Play'}
              </Button>
            </div>
            
            
            {isSuccess && (
              <div style={{ color: '#fff' }}>
                Successfully Played !
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
          </div>
          }
          bordered
          dataSource={countries}
          renderItem={(item,index) => (
            <List.Item>
              <Typography.Text strong>[{index}]  {item}</Typography.Text>
            </List.Item>
          )}
        />

    </div>
  )
}
