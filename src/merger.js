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
    data.rollback(srcuuid);

/*    let alldiff;
    if(!(strategy & ALLOWED_STRATEGIES.ALLOW_CONFLICT)){
      alldiff = data.diffCommits(data);
    }
*/
    let reapplyChanges = () => {
      //patch the merged commit
      commits.forEach(data.patch.bind(data));
    }

    try{
      //patch the merged commit
      data.patch(commit);

      reapplyChanges();

      if(!(strategy & ALLOWED_STRATEGIES.ALLOW_CONFLICT)){
        if(false)
        throw new Error("DATA CONFLICT error");
      }
    }catch(e){
      if(strategy & ALLOWED_STRATEGIES.ROLLBACK){
        data.rollback();
      }else{
        data.rollback(srcuuid);
        reapplyChanges();
      }
    }
}
