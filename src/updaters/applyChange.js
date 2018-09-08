export default function applyChange(d, datastruct, skipSubscribers = new Set()){
    switch(d.type){
        case "commit":

            return merger(
                datastruct, 
                d.data, 
                {
                    skipSubscribers,
                    strategy        : MERGER_STRATEGIES.LOCAL
                }
            );
        case "reset":{
            return datastruct.fromJS(d.data);
        }
        default:
            throw new Error("unknown type of request "+REQUEST_CLIENTCHANGE+"::"+d.type);
    }
}