

import { ethers } from 'ethers'
import {executeQuery} from "../utils/others"
import { BigNumber } from 'bignumber.js'
import { MerkleTree } from 'merkletreejs'

async function getPlayerRecords(index) {
    const query = `{
      playRecords(where: {
        index: ${index}
      }){
        id
        index
        player
        selectCountry
        block
      }
    }
    `;

    let data = await executeQuery(query, {})
    return data['data']['playRecords']
  }


  async function getWinnerHistory(index) {
    const query = `{
      finializeHistory(id: ${index}) {
        result
      }
    }
    `;
    let data = await executeQuery(query, {})
    return data['data']['finializeHistory']
  }



  function getPlayerRewardList(totalReward, records, winner) {
    // 遍历所有的records，计算每个人的奖励数量，返回一个数组，然后抛出来，后续使用进行merkel计算
    let group = {}
    let totalWeight = '0'
  
    records.map((it) => {
      // 猜中奖励翻倍
      // console.log('mapping it:', it);
      // console.log('it.selectCountry:', it.selectCountry, 'winner:', winner);
      let weight = (it.selectCountry === winner) ? 2 : 1
      return { it, weight }
    }).forEach((element) => {
      let value = group[element.it.player] || {
        list: [],
        weight: '0'
      }
  
      // console.log('current value:', value);
  
      value.list.push(element.it)
      value.weight = new BigNumber(value.weight).plus(element.weight).toFixed()
      totalWeight = new BigNumber(totalWeight).plus(element.weight).toFixed()
  
      group[element.it.player] = value
    });
  
    //console.log('group', group)
    //console.log('totalWeight', totalWeight)
  
    let playerDistributionList = []
    let actuallyAmt = "0"
  
    for (const player in group) {
      const item = group[player];
  
      // TODO dp是什么？
      item.reward = new BigNumber(item.weight).multipliedBy(totalReward).div(totalWeight).dp(0, BigNumber.ROUND_DOWN).toFixed();
      actuallyAmt = new BigNumber(actuallyAmt).plus(item.reward).toFixed()
  
      // console.log('total reward: ', totalReward, 'item.weight:', item.weight);
      //console.log('reward:', item.reward.toString());
      playerDistributionList.push({
        player: player,
        rewardAmt: item.reward
      })
    }
  
    return { playerDistributionList, actuallyAmt };
  }

  function generateLeaf(index, player, rewardAmt) {
    return ethers.utils.keccak256(
      ethers.utils.solidityPack(
        ['uint256', 'address', 'uint256'],
        [index, player, rewardAmt]
      ))
  }
  
  function generateMerkelTree(index, playerRewardList) {
    // make leafs
    let items = playerRewardList.map(it => {
      //console.log('it.rewardAmt:', it.rewardAmt);
      return generateLeaf(index, it.player, it.rewardAmt);
    })
  
    // create tree
    const tree = new MerkleTree(items, ethers.utils.keccak256, { sort: true })
    return tree
  }
  

  
async function getPlayerDistributions(index) {
    const query = ` {
      playerDistributions(
        where : {
          index: ${index}
        }
      ) {
        player
        rewardAmt
        weight
      }
    }
    `;
  
    // console.log('getWinnerHistory query:', query);
  
    let data = await executeQuery(query, {})
    return data['data']['playerDistributions']
  }


  async function getMerkelDistributor(index) {
    const query = ` {
      merkleDistributor(id: "${index}") {
        id
        index
        settleBlockNumber
        totalAmt
      }
    }
    `;
  
    let data = await executeQuery(query, {})
    return data['data']['merkleDistributor']
  }


export async function getDistributeInfo(CURRENT_ROUND,TOTAL_REWARD){
 
    // query subgraph to get user data
     const playRecords = await getPlayerRecords(CURRENT_ROUND)

     const winner = await getWinnerHistory(CURRENT_ROUND)
     //console.log(`winner for round ${CURRENT_ROUND} is : ${winner['result']}`);


    // 所有Player都会设置weight：1
    // 如果猜中了，weight: 2
    // calculate reward for each player
    if(winner!=null){
        const { playerDistributionList, actuallyAmt } = getPlayerRewardList(TOTAL_REWARD, playRecords, winner['result'])
        // console.log('reward list:', playerDistributionList, 'actuallyAmt:', actuallyAmt);
    
        const tree = generateMerkelTree(CURRENT_ROUND, playerDistributionList)
        return {tree,playerDistributionList,actuallyAmt}
    }else{
        return null
    } 
}


export async function getClaimWctToeknInfo(currentRound,currentPlayer){

    debugger
    
   const merkelDistributor=await getMerkelDistributor(currentRound)

   const totalAmount=merkelDistributor.totalAmt

   const DistributeInfo= await getDistributeInfo(currentRound,totalAmount)



  const playerDistributions=DistributeInfo.playerDistributionList
  const newTree=DistributeInfo.tree

    //1.返回当前用户领取Toke的数量
    const player = playerDistributions.filter(function (item) {
        return item.player === currentPlayer.toLowerCase()
      })[0]
    
    //2.生成叶子节点
    const leaf = generateLeaf(currentRound, player.player, player.rewardAmt)

    //3.拿到这个叶子节点的MerkelProof
    const proof=newTree.getHexProof(leaf);

    const rewardAmt=player.rewardAmt
    
    return [currentRound,rewardAmt,proof]
    
}