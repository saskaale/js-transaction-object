/*
 * strategy
 *    - discard
 *    - rollback
 */

const ALLOWED_STRATEGIES = {
  DISCARD:  0,
  ROLLBACK: 1,
  ALLOW_CONFLICT: 2
};

export default function(data, commit, strategy = ALLOWED_STRATEGIES.DISCARD){
    const {srcuuid} = commit;
    //merges the commit into the data tree

    if(!data.commited){
      throw new Error("data should not have uncommited changes");
    }

    let enduuid = data.uuid;
    let commits = data.commits(srcuuid);

    let olddiff;
    if(!(strategy & ALLOWED_STRATEGIES.ALLOW_CONFLICT)){
      olddiff = data.diffCommits(srcuuid);
    }

    //this would throw error in case commit not found
    data.rollback(srcuuid);

    let reapplyChanges = () => {
      //patch the merged` commit
      commits.forEach(data.patch.bind(data));
    }

    try{
      //patch the merged commit
      data.patch(commit);

      reapplyChanges();

      if(!(strategy & ALLOWED_STRATEGIES.ALLOW_CONFLICT)){
        let newdiff = data.diffCommits(srcuuid);
        console.log("OLDDIFF vs NEWDIFF");
        console.log(olddiff);
        console.log(newdiff);
        if(false){

          throw new Error("DATA CONFLICT error");
        }
      }
    }catch(e){
      if(strategy & ALLOWED_STRATEGIES.ROLLBACK){
        //ROLLBACK
        data.rollback();
      }else{
        //REVERT
        data.rollback(srcuuid);
        reapplyChanges();
      }
    }
}
