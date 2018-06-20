/*
 * strategy
 *    - discard
 *    - rollback
 */

const ALLOWED_STRATEGIES = {
  DISCARD:  Symbol('discard'),
  ROLLBACK: Symbol('rollback')
}

export default function(data, commit, strategy = ALLOWED_STRATEGIES.DISCARD){
    const {srcuuid} = commit;
    //merges the commit into the data tree

    if(!Object.values(ALLOWED_STRATEGIES).find(e=>e===strategy)){
      throw new Error('strategy has to either of ' +
          JSON.stringify(Object.values(allowedStrategies)));
    }

    let commits = data.commits(srcuuid);
    data.rollback(srcuuid);

    let reapplyChanges = () => {
      //patch the merged commit
      commits.forEach(data.patch.bind(data));
    }

    try{
      //patch the merged commit
      data.patch(commit);

      reapplyChanges();
    }catch(e){
      switch(strategy){
        case 'discard':
          data.rollback(sourceid);
          reapplyChanges();
          break;
        case 'rollback':
          data.rollback();
          break;
      }
    }
}
