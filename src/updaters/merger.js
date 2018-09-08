import {TinySeq} from '../utils';

/*
 * strategy
 *    - discard
 *    - rollback
 */

const STRATEGIES = {
  LOCAL:  0,
  REMOTE: 1,
};

const is = (strategy, flag) => strategy & flag;

const defaultConf = {
  strategy: STRATEGIES.LOCAL,
}

export default function(data, commit, conf = {}){
    conf = TinySeq(defaultConf).concat(conf).toObject();

    const {strategy, skipSubscribers} = conf;
    const {srcuuid} = commit;

    //merges the commit into the data tree

    if(!data.commited){
      throw new Error("data should not have uncommited changes");
    }

    let commits = data.commits(srcuuid);
    let reverted = {};
    let applied = false;

    const rollbackToSrcuuid = () => {
      applied = false;
      data.rollback(srcuuid);
      TinySeq(commits).forEach(({uuid}) => {reverted[uuid] = true});
    }
    let reapplyChanges = () => {
      //patch the merged` commit
      commits.forEach(commit=>{
        reverted[commit.uuid] = false;
        data.patch(commit, skipSubscribers);
      });
    }
    const applyCommit = () => {
      data.patch(commit, skipSubscribers);
      applied = true;
    }

    //this would throw error in case commit not found
    rollbackToSrcuuid();

    try{
      //patch the merged commit
      applyCommit();
      reapplyChanges();
    }catch(e){
      rollbackToSrcuuid();
      if(is(strategy, STRATEGIES.REMOTE)){
        applyCommit();
      }else if(is(strategy, STRATEGIES.LOCAL)){
        //REVERT
        reapplyChanges();
      }
    }

    reverted[commit.uuid] = !applied;
    reverted = TinySeq(reverted).filter(e=>e).map((_,k)=>k).toArray();

    return {
      applied,
      reverted
    }
}

export {STRATEGIES};
