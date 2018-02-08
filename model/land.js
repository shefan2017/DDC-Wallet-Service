console.log("==============Kongtou===")
module.exports={
    name:'lands',
    fields:[
        {
            name:"id",
            type:"String",
            length:"20",
            not_null:true,
            primary_key:true
        },
        {
            name:"name",
            type:"String",
            length:64,
            not_null:true,
        },
        {
            name:"lng",
            type:"String",
            length:"200",
            not_null:true
        },{
            name:"areaId",
            type:"String",
            length:"20",
            not_null:true
        },{
            name:"timestamp",
            type:"Number",
            not_null:true
        },
        ,{
            name:'address',//所在地址城市
            type:"String",
            length:"120",
            not_null:true
        },
        {
            name: 'authorId',//所属者地址
            type: 'String',
            length: 50,
            not_null: true
        },{
            name:"status",
            type:"String",
            length:50,
            not_null:true
        },{
            name:"auctionId",
            type:"String",
            length:50,
            not_null:false
        }

    ]
}