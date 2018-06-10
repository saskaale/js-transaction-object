/*
 * strategy
 *    - discard
 *    - rollback
 */

const ALLOWED_STRATEGIES = {
  DISCARD:  Symbol('discard'),
  ROLLBACK: Symbol('rollback')
}

export default function(data, sourceid, commit, strategy = ALLOWED_STRATEGIES.DISCARD){
    //merges the commit into the data tree

    if(!ALLOWED_STRATEGIES.find(e=>e===strategy)){
      throw new Error('strategy has to either of ' +
          JSON.stringify(Object.values(allowedStrategies)));
    }

    let is_rollback = sourceid !== data.transactionUuid;
    let commits = data.commits(sourceid, data.transactionUuid);
    data.rollback(sourceid);

    let reapplyChanges = () => {
      //patch the merged commit
      commits.forEach(({uuid, diff}) => {
        data.patch(diff, uuid);
      });
    }

    let diff = data.diff(data.immutable, commit.version);

    try{
      //patch the merged commit
      data.patch(diff, commit.uuid);

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
