/**
 * 区域模型
 * 2018/1/27 14.05
 */
console.log("==============areas===")
module.exports={
    name:"areas",//模型名
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
            length:"120",
            not_null:true
        },
        {
            name:"timestamp",
            type:"Number",
            length:"120",
            not_null:true
        },{
            name:'address',
            type:"String",
            length:"120",
            not_null:true
        },
        {
            name: 'authorId',//
            type: 'String',
            length: 50,
            not_null: true
        }
    ]

}
