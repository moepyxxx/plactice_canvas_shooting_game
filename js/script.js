(() => {
  window.isKeyDown = {};
  window.gameScore = 0;

  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 480;
  const SHOT_MAX_COUNT = 10;
  const ENEMY_SMALL_MAX_COUNT = 20;
  const ENEMY_LARGE_MAX_COUNT = 5;
  const ENEMY_SHOT_MAX_COUNT = 50;
  const EXPLOSION_MAX_COUNT = 10;

  const BACKGROUND_STAR_MAX_COUNT = 100;
  const BACKGROUND_STAR_MAX_SIZE = 3;
  const BACKGROUND_STAR_MAX_SPEED = 4;

  let util = null;
  let canvas = null;
  let ctx = null;
  let startTime = null;
  let viper = null;
  let enemyArray = [];
  let shotArray = [];
  let singleShotArray = [];
  let enemyShotArray = [];
  let backgroundStarArray = [];
  let explosionArray = [];

  let scene = null;
  let restart = false;

  window.addEventListener(
    "load",
    () => {
      util = new Canvas2DUtility(document.getElementById("main_canvas"));
      canvas = util.canvas;
      ctx = util.context;

      initialize();

      loadCheck();
    },
    false
  );

  function loadCheck() {
    let ready = true;
    ready = ready && viper.ready;
    enemyArray.map((v) => (ready = ready && v.ready));
    shotArray.map((v) => (ready = ready && v.ready));
    singleShotArray.map((v) => (ready = ready && v.ready));
    enemyShotArray.map((v) => (ready = ready && v.ready));

    if (ready) {
      eventSetting();
      sceneSetting();
      startTime = Date.now();
      render();
    } else {
      setTimeout(loadCheck, 100);
    }
  }

  function initialize() {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    scene = new SceneManager();

    viper = new Viper(ctx, 0, 0, 64, 64, "image/viper.png");
    viper.setComing(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT + 50,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 100
    );

    for (let i = 0; i < ENEMY_SHOT_MAX_COUNT; ++i) {
      enemyShotArray[i] = new Shot(ctx, 0, 0, 32, 32, "./image/enemy_shot.png");
    }

    for (i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i) {
      enemyArray[i] = new Enemy(ctx, 0, 0, 48, 48, "./image/enemy_small.png");
      // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
      enemyArray[i].setShotArray(enemyShotArray);
      // 敵キャラクターは常に自機キャラクターを攻撃対象とする
      enemyArray[i].setAttackTarget(viper);
    }
    for (i = 0; i < ENEMY_LARGE_MAX_COUNT; ++i) {
      enemyArray[ENEMY_SMALL_MAX_COUNT + i] = new Enemy(
        ctx,
        0,
        0,
        64,
        64,
        "./image/enemy_large.png"
      );
      // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
      enemyArray[ENEMY_SMALL_MAX_COUNT + i].setShotArray(enemyShotArray);
      // 敵キャラクターは常に自機キャラクターを攻撃対象とする
      enemyArray[ENEMY_SMALL_MAX_COUNT + i].setAttackTarget(viper);
    }

    for (let i = 0; i < SHOT_MAX_COUNT; ++i) {
      shotArray[i] = new Shot(ctx, 0, 0, 32, 32, "image/viper_shot.png");
      singleShotArray[i * 2] = new Shot(
        ctx,
        0,
        0,
        32,
        32,
        "image/viper_single_shot.png"
      );
      singleShotArray[i * 2 + 1] = new Shot(
        ctx,
        0,
        0,
        32,
        32,
        "image/viper_single_shot.png"
      );
    }

    viper.setShotArray(shotArray, singleShotArray);

    for (let i = 0; i < EXPLOSION_MAX_COUNT; ++i) {
      explosionArray[i] = new Explosion(ctx, 30.0, 40, 20.0, 0.25);
      enemyShotArray[i].setTargets([viper]);
      enemyShotArray[i].setExplosions(explosionArray);
    }

    for (let i = 0; i < SHOT_MAX_COUNT; ++i) {
      shotArray[i].setTargets(enemyArray);
      singleShotArray[i * 2].setTargets(enemyArray);
      singleShotArray[i * 2 + 1].setTargets(enemyArray);
      shotArray[i].setExplosions(explosionArray);
      singleShotArray[i * 2].setExplosions(explosionArray);
      singleShotArray[i * 2 + 1].setExplosions(explosionArray);
    }

    for (let i = 0; i < BACKGROUND_STAR_MAX_COUNT; ++i) {
      let size = 1 + Math.random() * (BACKGROUND_STAR_MAX_SIZE - 1);
      let speed = 1 + Math.random() * (BACKGROUND_STAR_MAX_SPEED - 1);
      backgroundStarArray[i] = new BackgroundStar(ctx, size, speed);
      let y = Math.random() * CANVAS_HEIGHT;
      let x = Math.random() * CANVAS_WIDTH;
      backgroundStarArray[i].set(x, y);
    }
  }

  function render() {
    ctx.globalAlpha = 1.0;
    util.drawRect(0, 0, canvas.width, canvas.height, "#111122");
    let nowTime = (Date.now() - startTime) / 1000;

    ctx.font = "bold 24px monospace";
    util.drawText(zeroPadding(gameScore, 5), 30, 50, "#111111");

    scene.update();
    backgroundStarArray.map((v) => {
      v.update();
    });
    viper.update();
    shotArray.map((v) => v.update());
    singleShotArray.map((v) => v.update());
    enemyShotArray.map((v) => v.update());
    enemyArray.map((v) => v.update());
    explosionArray.map((v) => v.update());

    requestAnimationFrame(render);
  }

  function eventSetting() {
    window.addEventListener(
      "keydown",
      (event) => {
        isKeyDown[`key_${event.key}`] = true;
        if (event.key === "Enter") {
          if (viper.life <= 0) {
            restart = true;
          }
        }
      },
      false
    );
    window.addEventListener(
      "keyup",
      (event) => {
        isKeyDown[`key_${event.key}`] = false;
      },
      false
    );
  }

  function sceneSetting() {
    scene.add("intro", (time) => {
      if (time > 3.0) {
        scene.use("invade_default_type");
      }
    });

    scene.add("invade_default_type", (time) => {
      if (scene.frame === 0) {
        for (let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i) {
          if (enemyArray[i].life <= 0) {
            let e = enemyArray[i];
            e.set(CANVAS_WIDTH / 2, -e.height, 2, "default");
            e.setVector(0.0, 1.0);
            break;
          }
        }
      }
      if (scene.frame === 270) {
        scene.use("blank");
      }
      if (viper.life <= 0) {
        scene.use("gameover");
      }
    });

    scene.add("blank", (time) => {
      if (scene.frame === 150) {
        scene.use("invade_wave_move_type");
      }
      if (viper.life <= 0) {
        scene.use("gameover");
      }
    });

    scene.add("invade_wave_move_type", (time) => {
      if (scene.frame * 50 === 0) {
        for (let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i) {
          if (enemyArray[i].life <= 0) {
            let e = enemyArray[i];
            if (scene.frame <= 200) {
              // 左側を進む
              e.set(CANVAS_WIDTH * 0.2, -e.height, 2, "wave");
            } else {
              // 右側を進む
              e.set(CANVAS_WIDTH * 0.8, -e.height, 2, "wave");
            }
            break;
          }
        }
      }
      if (scene.frame === 450) {
        scene.use("invade_large_type");
      }
      // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
      if (viper.life <= 0) {
        scene.use("gameover");
      }
    });

    scene.add("invade_large_type", (time) => {
      // シーンのフレーム数が 100 になった際に敵キャラクター（大）を配置する
      if (scene.frame === 100) {
        // ライフが 0 の状態の敵キャラクター（大）が見つかったら配置する
        let i = ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT;
        for (let j = ENEMY_SMALL_MAX_COUNT; j < i; ++j) {
          if (enemyArray[j].life <= 0) {
            let e = enemyArray[j];
            // 画面中央あたりから出現しライフが多い
            e.set(CANVAS_WIDTH / 2, -e.height, 50, "large");
            break;
          }
        }
      }
      // シーンのフレーム数が 500 になったとき intro へ
      if (scene.frame === 500) {
        scene.use("intro");
      }
      // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
      if (viper.life <= 0) {
        scene.use("gameover");
      }
    });

    scene.add("gameover", (time) => {
      let textWidth = CANVAS_WIDTH / 2;
      let loopWidth = CANVAS_WIDTH + textWidth;
      // scene.frame * 2 で文字が右から左に流れるようにする
      let x = CANVAS_WIDTH - ((scene.frame * 2) % loopWidth);
      //   console.log(scene.frame, "scene.frame");
      //   console.log(textWidth, "textWidth");
      //   console.log(loopWidth, "loopWidth");
      //   console.log(scene.frame * 2, "scene.frame * 2");
      //   console.log(
      //     (scene.frame * 2) % loopWidth,
      //     "(scene.frame * 2) % loopWidth"
      //   );
      //   console.log(x, "x");
      ctx.font = "bold 72px sans-serif";
      util.drawText("GAME OVER", x, CANVAS_HEIGHT / 2, "#ff0000", textWidth);

      if (restart === true) {
        restart = false;
        gameScore = 0;
        viper.setComing(
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT + 50,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT - 100
        );
        scene.use("intro");
      }
    });

    scene.use("intro");
  }

  function zeroPadding(number, count) {
    let zeroArray = new Array(count);
    let zeroString = zeroArray.join("0") + number;
    return zeroString.slice(-count);
  }
})();
