// グローバルに展開
phina.globalize();

var dummy = 0;

//受信するJsonの格納先
var gotMes = "";
/*
var app = Elm.Elm_to_JS.init({
  node: document.getElementById('myapp')
});
  app.ports.sendMes.subscribe(function(str) {
    alert(str);
	gotMes = str;
    app.ports.receiveMes.send(str);
  });
  */

//Elm側でエンコードしたJsonの獲得
window.addEventListener("message", receiveMessage, false);
function receiveMessage(event){
	gotMes = event.data;
}

//アセット
var ASSETS = {
	image: {
		'chara1': './chara1-1.png',
		'chara2': './chara1-2.png',
	},
};

//外部からの命令を格納する配列
var inFunc = [];
//その配列に命令を格納する関数
function useF(f,n,m){
	//配列の末尾に要素を追加
	inFunc.push(Array(f,n,m));
};
//スプライトの情報
var s = {x:0,y:0,r:0,d:1};


//自動用　trueにすると動作終了まで処理を続ける
var auto = false;
//手動用　trueにする度に処理を1回行う
var goNext = false;


/*
 * メインシーン
 */
phina.define("MainScene", {
	// 継承
	superClass: 'DisplayScene',
	// 初期化
	init: function() {
		// 親クラス初期化
		this.superInit();
		// 背景色
		this.backgroundColor = 'skyblue';
		// 以下にコードを書いていく

		//スプライト
		this.sprite = DisplayElement().addChildTo(this);
		this.sprite1 = Sprite('chara1').addChildTo(this.sprite);
		this.sprite2 = Sprite('chara2').addChildTo(this.sprite);
		this.sprite2.alpha = 0;
		this.sprite.x = 320;
		this.sprite.y = 480;// + 120;
		this.sprite.draggable;
		//スプライトの基点
		this.sprite.origin.set(0.5, 1);
		this.sprite1.origin.set(0.5, 1);
		this.sprite2.origin.set(0.5, 1);
		//スプライトの拡大率
		this.sprite.scaleX = 0.7;
		this.sprite.scaleY = 0.7;
		//スプライトのベクトル
		this.v = Vector2(1,0);
		//スプライトの方向
		this.direction = 1;
	
		//ペン使用中のフラグ
		this.pen = false;
		//スプライトが動いた時のフラグ
		this.move = false;

		//if制御で用いる数字
		this.ifNum = 0;

		//実行中の処理を文字列で表示
		label = Label({fontSize: 32}).addChildTo(this).setPosition(640,0);
		label.origin.set(1,0);
		//スプライトのx,y座標
		this.labelXY = Label({fontSize: 32}).addChildTo(this).setPosition(640,108);
		this.labelXY.origin.set(1,0);
		//スプライトの向き
		this.labelR = Label({fontSize: 32}).addChildTo(this).setPosition(640,144);
		this.labelR.origin.set(1,0);

		//プログラムを格納する配列、処理中のインデックス値、キー
		prog = new Array();
		progObj = {};

		//ボタン
		button1 = Button({
			x: 1,             // x座標
			y: 1,             // y座標
			width: 120,         // 横サイズ
			height: 32,        // 縦サイズ
			text: "動作終了",     // 表示文字
			fontSize: 16,       // 文字サイズ
			fontColor: '#000000', // 文字色
			cornerRadius: 3,   // 角丸み
			fill: '#ffffff',    // ボタン色
			stroke: 'black',     // 枠色
			strokeWidth: 1,     // 枠太さ
		}).addChildTo(this)
		button1.origin.set(0,0);
		var button2 = Button({
			x: 1,             // x座標
			y: 112,             // y座標
			width: 150,         // 横サイズ
			height: 32,        // 縦サイズ
			text: "1つすすむ",     // 表示文字
			fontSize: 16,       // 文字サイズ
			fontColor: '#000000', // 文字色
			cornerRadius: 3,   // 角丸み
			fill: '#ffffff',    // ボタン色
			stroke: 'black',     // 枠色
			strokeWidth: 1,     // 枠太さ
		}).addChildTo(this)
		button2.origin.set(0,0);
		var button3 = Button({
			x: 1,             // x座標
			y: 56,             // y座標
			width: 150,         // 横サイズ
			height: 32,        // 縦サイズ
			text: "オート",     // 表示文字
			fontSize: 16,       // 文字サイズ
			fontColor: '#000000', // 文字色
			cornerRadius: 3,   // 角丸み
			fill: '#ffffff',    // ボタン色
			stroke: 'black',     // 枠色
			strokeWidth: 1,     // 枠太さ
		}).addChildTo(this)
		button3.origin.set(0,0);

		//button1.width = 150;

		//ボタンクリック時の処理
		//動作終了ボタン
		button1.onpointend = function(){
			//文字表示
			label.text = "動作終了";
			//初期化
			progObj = {};
			prog = [];
		};
		//一つすすむボタン
		button2.onpointend = function(){
			//処理実行のフラグ
			goNext = true;
		};
		//オートボタン
		button3.onpointend = function(){
			//オート時なら解除
			if(auto){
				auto = false;
				this.text = "オート";
			}else{
				auto = true;
				this.text = "オート解除";
			}
		};

	},

	// 毎フレーム更新処理
	update: function () {
		// 以下にコードを書いていく

		//Json獲得直後の処理
		if(gotMes){
			//this.label.text = gotMes;
			//初期化　progにデコードした情報を全て格納する
			try {
				prog = JSON.parse(gotMes);
				progObj = {};
			} catch (error) {  //失敗した場合
				console.log("デコードに失敗しました : " + gotMes);
			}
			//格納済みなので元のJsonを削除
			gotMes = "";
			//動作開始のブロックを直ちに実行させる
			goNext = true;
		}
		
		//オート時ならgoNextを強制的に実行させる
		if(auto) goNext = true;

		//プログラム処理
		//プログラムが存在する 尚且つ goNextがTrue
		if(prog.length && goNext){
			//直ちにgoNextをfalseにし、オート時でない場合は繰り返さない
			goNext = false;
			//動作開始の処理
			//progObjは処理中の抽象構文木であり、その根の処理を実行する
			if(!Object.keys(progObj).length){
				//根がCommandNOPである構文木を格納する
				progObj = this.sarchAST("CommandNOP");
			}
			//ブロックの処理 または 動作終了
			//次に処理するブロックが存在しない場合
			if(progObj == "Nil"){
				//初期化
				progObj = {};
				prog = [];
				label.text = "動作完了";
			}else{
				//ブロックの情報を読み取り、動作処理を行う
				this.doCommand(progObj.node.getBrickType, progObj.node.getBrickCommand, progObj.node.getBrickArgument);
			}
		}
		//何も処理していなくてもgoNextはfalseにしておく
		if(goNext) goNext = false;
		
		//命令が存在する場合は処理
		//多分使用していない
		if(inFunc.length){
			//動作
			this.useFunc(inFunc[0][0], inFunc[0][1], inFunc[0][2]);
			//配列の先頭の要素を取り出す
			inFunc.shift();
		}

		//XY座標の表示の更新
		this.labelXY.text = '( ' + parseInt(this.sprite.x-320,10) + ', ' + parseInt(this.sprite.y-480,10) +')';
		//スプライトの向き表示の更新　-360度 ～ 360度
		this.labelR.text = (this.sprite.rotation %= 360) + '度';
		//確認用　いらない
		s.x = this.sprite.x;
		s.y = this.sprite.y;
		s.r = this.sprite.rotation;
		s.d = this.direction +1;
	},

	//スプライトの動作を行う関数
	useFunc: function (f,n,m) {
		//関数開始 または 関数移動
		if(f>100){
			//関数移動
			if(n>0){
				this.nextBlock(f);
				label.text = '関数' + (f-100) + 'へ移動';
			}
			//関数開始
			else{
				this.nextBlock(0);
				label.text = '関数' + (f-100) + 'を開始';
			}
		}else{
		switch(f){
		//前進
	  	case 0:
  			this.sprite.moveBy(n * this.v.x, n * this.v.y);
			label.text = n + '歩前進'
			if(this.pen) this.move = true;
			this.nextBlock(0);
			break;
		//右回転
		
	  	case 1:
			this.turnV(this.sprite.rotation+=n);
			label.text = n + '度右回転'
			this.nextBlock(0);
			break;
		//左回転
	  	case 2:
  			this.turnV(this.sprite.rotation-=n);
			label.text = n + '度左回転'
			this.nextBlock(0);
			break;
		//向き指定
	  	case 3:
  			this.turnV(this.sprite.rotation = n);
			label.text = n + '度の向き'
			this.nextBlock(0);
			break;
		//反転
	  	case 4:
  			this.direction*=-1.0;
			this.sprite.scaleX *= -1.0;
			this.v.x *= -1;
			this.v.y *= -1;
			label.text = '左右反転'
			this.nextBlock(0);
			break;
		//x座標指定
	  	case 5:
  			this.sprite.x = 320 + n;
			label.text = 'x座標を' + n + 'にする'
			if(this.pen) this.move = true;
			this.nextBlock(0);
			break;
		//x座標更新
	  	case 6:
  			this.sprite.x += n;
			label.text = 'x座標を' + n + 'ずつ移動'
			if(this.pen) this.move = true;
			this.nextBlock(0);
			break;
		//y座標指定
	  	case 7:
  			this.sprite.y = 480 + n;
			label.text = 'y座標を' + n + 'にする'
			if(this.pen) this.move = true;
			this.nextBlock(0);
			break;
		//y座標更新
	  	case 8:
  			this.sprite.y += n;
			label.text = 'y座標を' + n + 'ずつ移動'
			if(this.pen) this.move = true;
			this.nextBlock(0);
			break;
		//xy座標指定
	  	case 9:
  			this.sprite.x = 320 + n;
  			this.sprite.y = 480 + m;
			label.text = 'x座標を' + n + 'にする\ny座標を' + m + 'にする'
			if(this.pen) this.move = true;
			this.nextBlock(0);
			break;
		//xy座標更新
	  	case 10:
  			this.sprite.x += n;
			this.sprite.y += m;
			label.text = 'x座標を' + n + 'ずつ移動\ny座標を' + m + 'ずつ移動'
			if(this.pen) this.move = true;
			this.nextBlock(0);
			break;
		//ペンを下げる
	  	case 11:
			this.pen = true;
			this.sprite1.alpha = 0;
			this.sprite2.alpha = 1;
			this.drawLine();
			label.text = 'ペンを下げる'
			this.nextBlock(0);
			break;
		//ペンを上げる
	  	case 12:
			this.pen = false;
			this.sprite1.alpha = 1;
			this.sprite2.alpha = 0;
			label.text = 'ペンを上げる'
			this.nextBlock(0);
			break;
		//if制御
		case 90:
			if(isNaN(n)){
				if(this.checkSomething( n.split(' ') )){
					console.log(true);
					label.text = 'if制御\n' + n + '\n判定：true'
					this.nextBlock(1);
				}else{
					console.log(false);
					label.text = 'if制御\n' + n + '\n判定：false'
					this.nextBlock(2);
				}
			}else{
				if(n&&true){
					console.log(true);
					label.text = 'if制御\n' + n + '\n判定：true'
					this.nextBlock(1);
				}else{
					console.log(false);
					label.text = 'if制御\n' + n + '\n判定：false'
					this.nextBlock(2);
				}
			}
			break;
		//動作開始
		case 100:
			label.text = '動作開始';
			this.nextBlock(0);
			break;
		//強制終了
		default:
			progObj = "Nil";
			break;
		}
		}
	},
	//スプライトの向きを更新
	turnV: function (n) {
  		this.v.x = Math.cos(3.1415*n/180)*this.direction;
  		this.v.y = Math.sin(3.1415*n/180)*this.direction;
	},
	//if制御関係　前置記法の条件文の処理
	checkSomething: function (str) {
		console.log(str);
		const n = str.shift();
		if(isNaN(n)){
			switch( n ){
			case '!': console.log('check !'); return !this.checkSomething(str);
			case '&':
				console.log('check &');
				//判定する前に2つの数値を読み込む
				const m1 = this.checkSomething(str);
				return this.checkSomething(str)&&m1;
			case '|':
				console.log('check |');
				//判定する前に2つの数値を読み込む
				const m2 = this.checkSomething(str);
				return this.checkSomething(str)||m2;
			case '=': console.log('check ='); return this.checkSomething(str)==this.checkSomething(str);
			case '>': console.log('check >'); return this.checkSomething(str)>this.checkSomething(str);
			case '<': console.log('check <'); return this.checkSomething(str)<this.checkSomething(str);
			case '*': console.log('check *'); return this.checkSomething(str)*this.checkSomething(str);
			case '/': console.log('check /'); return this.checkSomething(str)/this.checkSomething(str);
			case '+': console.log('check +'); return this.checkSomething(str)+this.checkSomething(str);
			case '-': console.log('check -'); return this.checkSomething(str)-this.checkSomething(str);
			case 'X': console.log('check x'); return this.sprite.x-320;
			case 'Y': console.log('check y'); return this.sprite.y-480;
			case 'R': console.log('check r'); return this.sprite.rotation;
			case 'D': console.log('check d'); return this.direction;
			case 'true': console.log('check true'); return true;
			case 'false': console.log('check false'); return false;
			default: console.log('check ' + n + ' ?'); return n;
			}
		}else console.log('check ' + n); return n;
	},
	//次のブロックを判別
	nextBlock: function (n) {
		//console.log("E "+n)  //動作確認用5
		//関数移動の処理
		if(n > 100){
			progObj = this.sarchAST("CommandFuncStart", n-100);
		}else{
			switch(n){
				//通常時の処理
				case 0:
					//下か右のどちらかにブロックがある場合
					if((progObj.bottom == "Nil") ^ (progObj.right == "Nil")){
						//console.log("F "+this.progObj);  //動作確認用6
						//下
						if(progObj.bottom != "Nil") progObj = progObj.bottom;
						//右
						else progObj = progObj.right;
					}else progObj = "Nil";
					//console.log("G "+this.progObj.node.getBrickCommand);  //動作確認用7
					break;
				//if判定 true時
				case 1:
					progObj = progObj.right;
					break;
				//if判定 false時
				case 2:
					progObj = progObj.bottom;
					break;
				//強制終了
				default :
					progObj = "Nil";
					break;
			}
		}
	},

	//線を引く関数
	drawLine: function () {
		//描画中となる線
  		var line = PathShape({
			paths:[
				Vector2(this.sprite.x, this.sprite.y)
			],
			stroke: "red",
			strokeWidth: 4
		}).addChildTo(this).setPosition(0,0);
		//描画中の線の更新
		line.update = () => {
			//スプライト動作後
			if(this.move){
				//フラグ削除
				this.move = false;
				//パス追加
				line.addPath(this.sprite.x, this.sprite.y);
			}
			//ペンを上げた
			if(!this.pen){
				//描画した線を別の線として保存
				this.saveLine(line);
				//描画中の線を削除
				line.remove();
			}
		}
	},
	//線を残す関数
	saveLine: function (line) {
		//線を定義
		var line0 = PathShape().addChildTo(this).setPosition(0,0);
		//パスを受け継ぐ
		line0.paths = line.paths;
		//青色
		line0.stroke = "blue";
	},

	//ブロック情報から特定のcommandを持つ根の構文木を抽出する
	sarchAST: function (command, num) {
		for (var i=0 ; i < prog.length; i++){
			dummy = i;
			if(prog[i].node.getBrickCommand == command){
				if(command == "CommandNOP" || command == "CommandFuncStart" && prog[i].node.getBrickArgument == String(num)){
					console.log(prog[i]);
					return prog[i];
				}
			}
		}
		//無い場合
		return "Nil";
	},

	//抽象構文木のプログラムの処理
	doCommand: function (type, command, argument) {
		console.log(command);
		switch (type){
			case "EntryBrick" :
				//動作開始
				if (command == "CommandNOP") this.useFunc(100);
				//関数開始
				else if (command == "CommandFuncStart"){
					//引数を数値に変換して判定
					const a = parseInt(argument);
					if (a > 0) this.useFunc(100 + a, 0);
					else progObj = "Nil";
				}
				//該当無し
				else progObj = "Nil";
				break;
			case "BasicBrick" :
				//引数を数値に変換　基本はInt型
				const b = parseInt(argument);
				//引数が数値として存在している場合
				if (! isNaN(b)){
					switch(command){
						case "CommandMove" : this.useFunc(0, b); break;
						case "CommandTurnRight" : this.useFunc(1, b); break;
						case "CommandTurnLeft" : this.useFunc(2, b); break;
						case "CommandTurnSet" : this.useFunc(3, b); break;
						//case "CommandResetXY" : this.useFunc(9,0,0); break;
						case "CommandSetX" : this.useFunc(5, b); break;
						case "CommandChangeX" : this.useFunc(6, b); break;
						case "CommandSetY" : this.useFunc(7, b); break;
						case "CommandChangeY" : this.useFunc(8, b); break;
						default : progObj = "Nil"; break;
					}
				}
				//引数なし
				else{
					switch(command){
						case "CommandTurnBack" : this.useFunc(4); break;
						case "CommandDownPen" : this.useFunc(11); break;
						case "CommandUpPen" : this.useFunc(12); break;
						default : console.log("argument error"); progObj = "Nil"; break;
					}
				}
				break;
			case "CaseBrick" :
				//commandがCommandIfの場合のみ
				if (command == "CommandIf") this.useFunc(90, argument);
				else progObj = "Nil";
				break;
			case "TailBrick" :
				//引数を数値に変換して判定
				const c = parseInt(argument);
				if(c > 0) this.useFunc(100 + c, c);
				else progObj = "Nil";
				break;
			//該当無し
			default : progObj = "Nil"; break;
		}
	}


});



/*
 * メイン処理
 */
phina.main(function() {
  // アプリケーションを生成
  var app = GameApp({
    // MainScene から開始
    startLabel: 'main',
	assets: ASSETS,
  });
  // fps表示
  //app.enableStats();
  // 実行
  app.run();
});



