var gen = function *(n) {
    for(var i = 0; i < 3;i++) {
        n++;

        yield n;    //暂停执行，保存当前位置的堆栈，返回当前n的值
    }
}

var genObj = gen(2); //genObj会立马执行的，这里循环了三次之后，n的值变成了5，
                    // 但这里使用了yield之后呢，结果就不一样了，调用gen之后，那到的genObj是一个迭代器对象，并不会去执行的，需要调用这个迭代器的next方法，才会从上一次暂停的地方开始执行，直到遇到下一个yield语句
                    //yield语句的作用是暂停执行后面的代码，当再次调用next方法，才会继续往下执行


console.log(genObj.next());         //3   {value:3, done: false}        迭代器函数执行next的时候总是返回一个对象  done表示生成器函数内部是否迭代完毕
console.log(genObj.next());         //4     {value: 4, done: false}
console.log(genObj.next());         //5     {value: 5, done: false}
console.log(genObj.next());         //undefined     {value:undefined, done: true}   done:true 生成器函数执行完毕
