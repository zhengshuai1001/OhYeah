import React from "react";
import ReactDOM  from "react-dom";
import update from 'immutability-helper';

window.renderFileFrequency = 0; //文件类型渲染次数
class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectPhoto: [],
            FormatPhoto: [],
            serverIds: [], //图片上传到腾讯服务器后的地址
            uploadIng: false, //是否在上传中，这个状态用于显示页面底部
            renderType: "image", //渲染的类型，也就是图片上传的类型，有两种，图片image和文档file, 默认是图片
            initFileAPIUploadFile: false, //是否已经实例化了，只实例化一次
        }
        window.ReactState = this.state;
        window.ReactAppSetState = this.setState.bind(this);
        window.ReactSetFormatPhoto = this.setFormatPhoto.bind(this);
        window.ReactUploadImages = this.uploadImages.bind(this);
        this.deletePhoto = this.deletePhoto.bind(this);
        this.clickDeletePhoto = this.clickDeletePhoto.bind(this);
        this.clickPhoto = this.clickPhoto.bind(this);
        this.setOnePhotoProgress = this.setOnePhotoProgress.bind(this); 
        window.ReactSetOnePhotoProgress = this.setOnePhotoProgress.bind(this); 
        this.goBack = this.goBack.bind(this);
        this.nextStep = this.nextStep.bind(this);
    }
    componentDidMount() {
        if (this.state.renderType = "file") {
            if (window.FileAPIUploadFile && !this.state.initFileAPIUploadFile) {
                window.FileAPIUploadFile("chooseUploadFile2"); //会导致多次实例化                       
                this.setState({ initFileAPIUploadFile: true});
            }
        }
        
        //先用假数据测试吧
        // let selectPhoto = window.selectPhoto;
        // this.setState({ selectPhoto },()=>{
        //     this.setFormatPhoto(() => {
        //         if (this.state.FormatPhoto.length > 0) {
        //             this.uploadImages(0);
        //         }
        //     });
        // })
        
    }
    //通过原始图片列表，构造一个长度为4的二维数组，加上进度条状态，用于渲染 
    setFormatPhoto(callBack = ()=>{}) {
        let selectPhoto = this.state.selectPhoto;
        let oldFormatPhoto = this.state.FormatPhoto;
        let photoLength = selectPhoto.length;
        let i = 0; //基准
        let FormatPhoto = []; //格式化的二维数组
        let outIndex = 0;
        
        do {
            let photoLine = []; //格式化的每行数组
            for (let j = 0; j < 4; j++) {
                let onePhoto = {};
                if (i < photoLength) {
                    onePhoto.type = "photo";
                    onePhoto.id = i; //此时的id为原数组的索引
                    onePhoto.src = selectPhoto[i];
                    onePhoto.progress = 0;
                    if (oldFormatPhoto[outIndex] && oldFormatPhoto[outIndex][j]) {
                        onePhoto.progress = oldFormatPhoto[outIndex][j].progress;
                    }
                }
                if (i == photoLength) {
                    onePhoto.type = "input";
                    onePhoto.id = i; //此时的id比原数组的索引大
                    onePhoto.src = "";
                    onePhoto.progress = 0;
                }
                if (i > photoLength) {
                    onePhoto.type = "empty";
                    onePhoto.id = i; //此时的id比原数组的索引大
                    onePhoto.src = "";
                    onePhoto.progress = 0;
                }
                photoLine.push(onePhoto)
                i++;
            }
            FormatPhoto.push(photoLine);
            outIndex++;
        } while (i <= photoLength);
        this.setState({ FormatPhoto },()=>{
            callBack();
            window.ReactState = this.state;
        });

    }
    //点击删除一张图片
    clickDeletePhoto(event, i) {
        event.stopPropagation();
        let type = this.state.renderType == "image" ? "图片" : "文件";

        weui.confirm(`确定删除这张${type}吗?`, {
            className: "delete-photo-confirm",
            title: `删除${type}`,
            buttons: [{
                label: '取消',
                type: 'default',
                onClick: () => { }
            }, {
                label: '确定',
                type: 'primary',
                onClick: () => { this.deletePhoto(i) }
            }]
        });
    }
    //真真的删除一张图片
    deletePhoto(i) {
        // console.log("deletePhoto::" + i);
        // console.log(this.state.selectPhoto[i])

        // 首先在界面上删除这个图片，至于具体怎么删除，还得看具体代码怎么写的吧
        let oldSelectPhoto = this.state.selectPhoto;
        const newSelectPhoto = update(oldSelectPhoto, { $splice: [[i, 1]] });
        this.setState({ selectPhoto: newSelectPhoto }, () => {
            this.setFormatPhoto();
            window.ReactState = this.state;
        });

        //具体的删除图片代码，得看后端是怎写的
        
    }
    //点击图片，预览
    clickPhoto(i) {
        // console.log("clickPhoto::" + i);
        if (this.state.renderType == "file") {
            return;
        }
        // console.log(this.state.selectPhoto[i]);
        if (window.wx) {
            let current = this.state.selectPhoto[i];
            let urls = this.state.selectPhoto;
            window.wx.previewImage({
                current, // 当前显示图片的http链接
                urls, // 需要预览的图片http链接列表
            });
        }
    }
    addPhoto(i) {
        // console.log("addPhoto::" + i);
        if (this.state.renderType == "file") {
            return;
        }
        if (window.wx) {
            wx.chooseImage({
                count: 9, // 默认9
                sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: (res) => {
                    // console.log(JSON.stringify(res));
                    let localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                    // window.selectPhoto = localIds;
                    let oldSelectPhoto = this.state.selectPhoto;
                    const newSelectPhoto = update(oldSelectPhoto, { $push: localIds });
                    this.setState({ selectPhoto: newSelectPhoto }, () => {
                        this.setFormatPhoto(() => {
                            if (this.state.FormatPhoto.length > 0) {
                                this.uploadImages(i);
                                window.ReactState = this.state;
                            }
                        });
                    })
                }
            });
        }
    }
    //上传图片
    uploadImages(i = 0) {
        let FormatPhoto = this.state.FormatPhoto;
        let selectPhoto = this.state.selectPhoto;
        if (window.wx) {
            if ((selectPhoto.length <= i && FormatPhoto.length > 0) || i > 100 ) {
                // console.log("上传完毕");
                // console.log(this.state.serverIds);
                
                this.setState({ uploadIng: false})
                return;
            } else {
                //开始上传
                if (this.state.uploadIng == false) {
                    this.setState({ uploadIng: true })
                }
            }
            let localId = selectPhoto[i];
            //解决IOS无法上传的坑
            if (localId.indexOf("wxlocalresource") != -1) {
                localId = localId.replace("wxlocalresource", "wxLocalResource");
            }
            //显示进度条动画
            let step = 0;
            this.token = setInterval(()=>{
                if (step < 1000) {
                    this.setOnePhotoProgress(i, step);
                    step += 2;
                } else {
                    this.setOnePhotoProgress(i, -1);
                    //去掉进度条动画
                    clearInterval(this.token);
                }
            },25)

            wx.uploadImage({
                localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
                isShowProgressTips: 0, // 默认为1，显示进度提示
                success: (res) => {
                    //去掉进度条动画
                    clearInterval(this.token);
                    // serverIds.push(res.serverId); // 返回图片的服务器端ID

                    //保存服务器地址
                    // console.log("this.state.serverIds");
                    // console.log(this.state.serverIds);
                    
                    // let oldServerIds = this.state.serverIds;
                    // const newServerIds = update(oldServerIds, { $push: res.serverId });
                    // this.setState({ serverIds: newServerIds });
                    let serverIds = this.state.serverIds;
                    serverIds.push(res.serverId);
                    this.setState({ serverIds });

                    //更新单个图片的上传进度，索引为i的这个图片，上传成功 
                    this.setOnePhotoProgress(i, 100);

                    //上传下一张
                    i++;
                    this.uploadImages(i);
                },
                fail: (res) => {
                    //去掉进度条动画
                    clearInterval(this.token);
                    // $.alert('上传失败，请重新上传！');
                    //更新单个图片的上传进度，索引为i的这个图片，上传失败，进度设置为-1 ，表示上传失败
                    this.setOnePhotoProgress(i, -1);
                    i++;
                    this.uploadImages(i);
                }
            });
        } else {
            
        }
    }
    /**
     * 设置某个图片的上传进度
     * 
     * @author ZhengGuoQing
     * @param {any} i 图片的id，图片的索引，即顺序
     * @param {any} newProgress 新的进度为多少，最小为0 ，最大为100，表示上传成功
     * @memberof App
     */
    setOnePhotoProgress(i = 0, newProgress = 0) {
        let oldFormatPhoto = this.state.FormatPhoto;
        // const newFormatPhoto = update(oldFormatPhoto, { $push: res.serverId });
        let outIndex = parseInt(i / 4); //外层索引
        let inIndex = i - outIndex * 4; //内层索引
        const newFormatPhoto = update(oldFormatPhoto, { [outIndex]: { [inIndex]: { progress: { $set: newProgress } } } });
        this.setState({ FormatPhoto: newFormatPhoto });
    }
    //点击返回按钮
    clickGoBack(event) {
        event.stopPropagation();
        if (this.state.selectPhoto.length < 1) {
            //如果长度为0，则直接返回
            this.goBack();
            return;
        }
        let type = this.state.renderType == "image" ? "图片" : "文件";
        weui.confirm(`返回将删除已选的${type}`, {
            className: "delete-photo-confirm",
            title: "确认返回吗?",
            buttons: [{
                label: '取消',
                type: 'default',
                onClick: () => { }
            }, {
                label: '确定',
                type: 'primary',
                onClick: () => { this.goBack() }
            }]
        });
    }
    goBack() {
        this.setState({
            selectPhoto: [],
            FormatPhoto: [],
        },()=>{
            window.ReactState = this.state;
        })

        $("#root").css("left", "100%");
    }
    nextStep() {
        //跳转到下一页
        // window.location.href = 'http://www.baidu.com';
        window.location.href = '../html/WeChatPay.html';
    }
    componentWillUnmount() {
        window.renderFileFrequency = 0; //重置文件类型的界面渲染次数
    }
    // componentWillUpdate() {
    //     if (this.state.renderType == "file") {
    //         if (this.refs.input) {
    //             console.log("FileAPI off 0");
    //             var choose = ReactDOM.findDOMNode(this.refs.input);
    //             FileAPI.event.off(choose)
    //         }
    //     }
    // }
    componentDidUpdate() {

        if (this.state.renderType == "file") {
            if (window.FileAPIUploadFile && !this.state.initFileAPIUploadFile) {
                window.FileAPIUploadFile("chooseUploadFile2"); //会导致多次实例化                       
                this.setState({ initFileAPIUploadFile: true });
            }
            // window.positionReactUploadInput();
            if (this.refs.input) {
                window.renderFileFrequency++;
                // console.log("chooseUploadFile2");
                // window.FileAPIUploadFile("chooseUploadFile2"); //会导致多次实例化           
            }
            if (window.renderFileFrequency == 1) {
                // window.FileAPIUploadFile("chooseUploadFile2"); //会导致多次实例化                           
            }

            // throttleDidUpdate = true;
            // this.tokenDidUpdate = setTimeout(() => {
            //     if (throttleDidUpdate = true) {
            //         throttleDidUpdate = false;
            //     }
            //     if (throttleDidUpdate = false) {
            //         window.positionReactUploadInput();
            //     }
            //     clearTimeout(this.tokenDidUpdate)
            // }, 200);
            // if (this.state.selectPhoto.length > 0 && !this.state.uploadIng) {
                if (!this.state.uploadIng) {
                window.positionReactUploadInput();
            }
        }
    }
    render() {
        return ([
            <div key="1" className="file-page am-image-picker-list" id="file-page">
                {
                    this.state.FormatPhoto.length > 0 &&
                    this.state.FormatPhoto.map((value, index)=>(
                        <div key={index} className="file-page-line am-flexbox am-flexbox-align-center">
                            {
                                value.length > 0 &&
                                value.map((val, i)=>{
                                    let photoLineDOM = [];
                                    if (val.type == "photo") {
                                        let photo = <div key={index + (i).toString()} onClick={() => { this.clickPhoto(val.id) }} className="upload-box am-flexbox-item">
                                                <div className="am-image-picker-item">
                                                <div onClick={(e) => { this.clickDeletePhoto(e,val.id)}} className="am-image-picker-item-remove" role="button" aria-label="Click and Remove this image"></div>
                                                <img 
                                                    className={this.state.renderType == "image" ? "am-image-picker-item-content" : "am-image-picker-item-content file"} 
                                                    src={val.src}
                                                    onError={(e) => { e.target.src = '../image/error.png' }}
                                                />
                                                    {
                                                        val.progress > 0 && val.progress < 100 ? 
                                                        <div className="weui-progress">
                                                            <div className="weui-progress__bar">
                                                                <div className="weui-progress__inner-bar js_progress" style={{ "width": val.progress + "%" }}></div>
                                                            </div>
                                                        </div> : null
                                                    }
                                                    {
                                                        val.progress == 0 ? <div className="wait-upload">等待上传</div> : null
                                                    }
                                                    {
                                                        val.progress < 0 ? <div className="wait-upload">上传失败</div> : null
                                                    }
                                                    {
                                                        val.progress >= 100 ? <div className="wait-upload">上传成功</div> : null
                                                    }
                                                </div>
                                            </div>
                                        photoLineDOM.push(photo)
                                    }
                                    if (val.type == "input") {
                                        let photo = <div key={index + (i).toString()} onClick={() => { this.addPhoto(val.id) }} className="upload-box am-flexbox-item">
                                            <div id={this.state.renderType == "file" ? "inputHook" : ""} className="am-image-picker-item am-image-picker-upload-btn" role="button" aria-label="Choose and add image">
                                                    {/* {
                                                        this.state.renderType == "file" ? <input ref="input" id="chooseUploadFile2" name="allFile_upload2" type="file" multiple="true" /> : null
                                                    } */}
                                                </div>
                                            </div>
                                        photoLineDOM.push(photo)
                                    }
                                    if (val.type == "empty") {
                                        let photo = <div key={index + (i).toString() } className="upload-box am-flexbox-item"></div>
                                        photoLineDOM.push(photo)
                                    }
                                    return photoLineDOM
                                })
                            }
                        </div>
                    ))
                }

            </div>,
            <div key="2" className="file-page-bottom">
                <div className="back" onClick={(e) => { this.clickGoBack(e) }}><i className="iconfont icon-jiantou_zuo"></i>返回</div>
                <div 
                    className={this.state.uploadIng ? "next-step loading" : "next-step" }
                >
                    {
                        this.state.uploadIng ? [<i key="0" className="weui-loading"></i>, <span key="1">上传中</span>] : <span onClick={this.nextStep}>下一步</span>
                    }
                    
                </div>
            </div>
        ])
    }
}

ReactDOM.render(<App />, document.getElementById("root"));
