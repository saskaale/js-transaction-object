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
    let last_applied_uuid = srcuuid;
    let applied = false;

    let reapplyChanges = () => {
      //patch the merged` commit
      commits.forEach(commit=>{
        data.patch(commit)
        last_applied_uuid = commit.uuid;
      });
    }

    try{
      //patch the merged commit
      data.patch(commit);
      applied = true;
      last_applied_uuid = commit.uuid;

      reapplyChanges();

      if(!(strategy & ALLOWED_STRATEGIES.ALLOW_CONFLICT)){
        let newdiff = data.diffCommits(srcuuid);
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
        applied = false;
        last_applied_uuid = srcuuid;
        reapplyChanges();
      }
    }

    return {
      current_uuid: last_applied_uuid,
      applied
    }
}
