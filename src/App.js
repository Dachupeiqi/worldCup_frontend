import {
  WagmiConfig,
  createClient,
  chain,
  configureChains,
  useContractRead,
  useAccount,
} from 'wagmi'
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultClient,
} from 'connectkit'
import { ConnectInfo } from './conponents/Button/Connect'
import { Play } from './conponents/Button/Play'
import { Finalize } from './conponents/Button/Finalize'
import { ClaimReward } from './conponents/Button/ClaimReward'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { Component } from 'react'
import styled from 'styled-components/macro'
import { Card, Col, Divider, Row } from 'antd'
import {converTime} from './utils/others'
import worldcup_abi from './abi/WorldCup.json'
import { ClaimWctReward } from './conponents/Button/ClaimWctReward'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
// const alchemyId = process.env.ALCHEMY_ID
const alchemyId = "N5MaHwqpQ8xSrnZpshO6Vc-2iglJaep_"

const { provider, chains } = configureChains(
  [chain.goerli, chain.optimism, chain.arbitrum],
  [alchemyProvider({ apiKey: alchemyId })]
)




const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      chains: chains,
      options: {
        qrcode: true,
      },
    }),
    new CoinbaseWalletConnector({
      chains: chains,
      options: {
        qrcode: true,
      },
    })
  ],
  provider,
})

const WagmiWarpper = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`

const ConnectWarpper = styled.div`
  width: 100%;
  height: 60px;
  padding: 0 60px;
  background-color: #111;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const imageUrl = require('./static/images/1120.jpeg')

const ContentWarpper = styled.div`
  width: 100;
  height: 100;
  padding: 100px;
  border: 1px solid #f5f5f5;
  border-radius: 10px;
  margin: 100px auto;
  background-image: url(${imageUrl});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  box-shadow: var(
    --elevation-200-canvas,
    0px 0px 0.5px rgba(0, 0, 0, 0.18),
    0px 3px 8px rgba(0, 0, 0, 0.1),
    0px 1px 3px rgba(0, 0, 0, 0.1)
  );
  > div {
    margin-bottom: 40px;
    .ant-btn {
      margin-bottom: 10px;
    }
    .ant-input {
      width: 200px;
      height: 40px;
      border-radius: 10px;
    }
  }
`
class App extends Component {
  constructor() {
    super()
    this.state = {
      name: 'duke',
    }
  }
  render() {
    function FetchDeadLine(){
      const { data} = useContractRead({
     addressOrName:'0xf9FDf6832eEdbAF5A3000A737Fa692838Ee8f8aC',
     contractInterface:worldcup_abi.abi,
     functionName: 'deadline',
      })
    
     return(
       <span>{converTime(data)}</span>
     )
    }


    return (
      <WagmiWarpper>
        <WagmiConfig client={client}>
          <ConnectWarpper>
            <div></div>
            <ConnectKitProvider>
              <ConnectKitButton />
            </ConnectKitProvider>
          </ConnectWarpper>
          {/* {<ConnectInfo />} */}

          <Divider orientation="left">截至时间：<FetchDeadLine/></Divider>
  
                <Row>
                  <Col span={24/3}>
                    <Card hoverable={true}>
                      <Play />
                    </Card>
                  </Col>

                  <Col span={24/3}>
                    <Card hoverable={true}>
                      <Finalize />
                    </Card>
                  </Col>

                  <Col span={24/3}>
                    <Card hoverable={true}>
                        <ClaimReward />
                        <br />
                        <ClaimWctReward />
                    </Card>
                  </Col>
                </Row>
           
        

          

        </WagmiConfig>
      </WagmiWarpper>
    )
  }
}

export default App
