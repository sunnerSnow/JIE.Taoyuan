import type { CategorySlug } from "@/data/types";
import { boundsOf, fromScreen, INK, Iso, project, shade, type IsoBounds, type Shape, type V3 } from "./iso";

// 政策島插畫：五座島＋中央廣場，全部用程式畫成等距線稿（參考 sunbousai.jp 的黑線描邊風格）

const WALL = "#FFFDF7";
const WALL2 = "#FFF3E2";
const GLASS = "#CFE6EE";
const ROAD = "#CDD8DB";
const PATH = "#F3E8D2";
const SAND = "#F2DFB6";
const SIDE = "#E7D8B6";
const TEAL = "#477D73";
const SUN = "#F5D45E";
const CORAL = "#EE9A7E";
const PEACH = "#F9E3D8";
const WATER = "#A9D3DF";
const WOOD = "#E6CFA2";

type IslandDef = {
  w: number;
  d: number;
  /** 島頂面中心在整張地圖上的螢幕位置 */
  screen: [number, number];
  /** 名牌插在哪裡（島的區域座標） */
  anchor: V3;
  /** 每項政策的小圖釘位置 */
  spots: V3[];
  draw: (g: Iso) => void;
};

function transport(g: Iso) {
  g.slab(0, 0, 32, 26, 5, 3, "#E4EEF0", SIDE);
  g.flat(0.4, 11, 0, 31.2, 5, ROAD, { sw: 0.9 });
  g.flat(22, 0.4, 0, 5, 25.2, ROAD, { sw: 0.9 });
  g.flat(22, 11, 0, 5, 5, ROAD, { stroke: null });
  g.line([[1, 13.5, 0], [21.2, 13.5, 0]], "#FFFFFF", 1.1, "1.6 1.6");
  g.line([[27.8, 13.5, 0], [31, 13.5, 0]], "#FFFFFF", 1.1, "1.6 1.6");
  g.line([[24.5, 1, 0], [24.5, 10.2, 0]], "#FFFFFF", 1.1, "1.6 1.6");
  g.line([[24.5, 16.8, 0], [24.5, 25, 0]], "#FFFFFF", 1.1, "1.6 1.6");
  for (let i = 0; i < 5; i++) g.flat(22.3 + i * 0.95, 9, 0, 0.5, 1.6, "#FFFFFF", { stroke: null });
  for (let i = 0; i < 5; i++) g.flat(20, 11.3 + i * 0.95, 0, 1.6, 0.5, "#FFFFFF", { stroke: null });
  for (let i = 0; i < 5; i++) g.flat(22.3 + i * 0.95, 16.4, 0, 0.5, 1.6, "#FFFFFF", { stroke: null });

  // 高架捷運：橋墩 → 車站 → 軌道 → 列車
  for (const px of [3, 19, 29]) g.box(px, 4.4, 0, 1, 1, 7, "#E9E4D8");
  g.box(8, 1.5, 0, 9, 8, 7, { top: "#F1EEE4", left: WALL, right: "#ECE5D4" });
  g.windowsL(9.5, 8.4, 16.6, 1.6, 4.6, 3, GLASS);
  g.winL(9.5, 11.6, 13.4, 0, 2.8, SUN);
  g.windowsR(17, 2, 9, 1.6, 4.6, 2, GLASS);
  g.winL(9.5, 8, 17, 5.6, 6.4, TEAL, { stroke: null });
  g.box(0.6, 4, 7, 30.8, 2, 1, { top: "#EFEBE0", left: "#E2DCCD", right: "#D6CFBE" });
  for (const cx of [4.5, 14]) {
    g.box(cx, 4.2, 8, 9, 1.6, 2.4, { top: "#F7F6F1", left: WALL, right: "#E2DED3" });
    g.winL(5.8, cx, cx + 9, 8.35, 8.75, TEAL, { stroke: null });
    g.windowsL(5.8, cx + 0.3, cx + 8.7, 9.1, 10, 4, GLASS);
  }
  g.winR(23, 4.4, 5.6, 8.9, 10, GLASS);

  // 科技執法：路口桿與監測站
  g.box(28, 6.5, 0, 3, 3, 3.2, { top: "#EDEAE0", left: WALL2, right: "#EADCC6" });
  g.winL(9.5, 28.6, 30.4, 1.2, 2.4, GLASS);
  g.line([[21, 9.6, 0], [21, 9.6, 5.5], [23, 9.6, 5.5]], INK, 1);
  g.box(22.6, 9.3, 4.6, 0.8, 0.6, 1.4, "#3E5E66");

  // 公車
  g.box(5, 11.8, 0.5, 10.5, 3.4, 3.6, { top: WALL, left: SUN, right: shade(SUN, -0.14) });
  g.windowsL(15.2, 5.4, 13.6, 2, 3.5, 4, GLASS);
  g.winR(15.5, 12.2, 14.8, 1.9, 3.6, GLASS);
  for (const wx of [7.2, 13.2]) g.free(wx, 15.2, 0.5, ([x, y]) => `M${x - 0.9} ${y}a0.9 0.9 0 1 0 1.8 0a0.9 0.9 0 1 0 -1.8 0Z`, "#3E5E66");

  // 公車站
  g.line([[3.4, 18.4, 0], [3.4, 18.4, 3]], INK, 1);
  g.line([[9.4, 18.4, 0], [9.4, 18.4, 3]], INK, 1);
  g.box(3, 17.6, 3, 7, 1.8, 0.35, "#8EC3D5");
  g.box(4.2, 18, 0, 4.5, 0.8, 0.8, WOOD);
  g.person(5.2, 19.8, 0, CORAL);
  g.person(7.4, 20.2, 0, "#8DA8C9", { h: 0.95 });

  // 共享單車站
  for (let i = 0; i < 4; i++) {
    const bx = 23 + i * 1.6;
    g.line([[bx, 20, 0.9], [bx + 1.2, 20, 0.9]], INK, 1);
    g.free(bx, 20, 0.5, ([x, y]) => `M${x - 0.5} ${y}a0.5 0.5 0 1 0 1 0a0.5 0.5 0 1 0 -1 0Z`, "none");
    g.free(bx + 1.2, 20, 0.5, ([x, y]) => `M${x - 0.5} ${y}a0.5 0.5 0 1 0 1 0a0.5 0.5 0 1 0 -1 0Z`, "none");
  }
  g.box(22.4, 21, 0, 7, 0.6, 0.4, SUN);
  g.tree(2.6, 22.5, 0, 0.9);
  g.tree(13, 22.6, 0, 1.05);
  g.pine(17.5, 21.5, 0, 0.8);
  g.person(19.5, 18.8, 0, TEAL, { h: 0.9 });
}

function family(g: Iso) {
  g.slab(0, 0, 28, 24, 5, 3, "#FBE7DB", SIDE);
  g.flat(0.4, 10, 0, 27.2, 2.2, PATH, { sw: 0.8 });

  // 托育中心
  g.box(2, 1.5, 0, 12, 7, 4.5, { top: WALL, left: WALL, right: "#F1E6D3" });
  g.gable(2, 1.5, 4.5, 12, 7, 3, "x", CORAL, WALL);
  g.windowsL(8.5, 2.4, 13.6, 1.4, 3.3, 4, GLASS);
  g.winL(8.5, 7.1, 8.9, 0, 2.7, SUN);
  g.free(14, 5, 6.1, ([x, y]) => `M${x - 0.9} ${y}a0.9 0.9 0 1 0 1.8 0a0.9 0.9 0 1 0 -1.8 0Z`, SUN, { sw: 0.9 });

  // 住宅
  g.box(17.5, 1.5, 0, 6.5, 5, 3.8, { top: WALL2, left: WALL2, right: "#EDDCC2" });
  g.gable(17.5, 1.5, 3.8, 6.5, 5, 2.6, "y", SUN, WALL2);
  g.windowsL(6.5, 18, 23.6, 1.2, 2.7, 2, GLASS);
  g.windowsR(24, 2, 6.2, 1.2, 2.7, 2, GLASS);
  g.tree(25.6, 8.4, 0, 0.8);

  // 遊戲場
  g.flat(2.5, 13.5, 0, 11, 8.2, SAND, { sw: 0.8 });
  g.box(4, 14.6, 0, 1.8, 1.8, 3.2, "#8DBFB1");
  g.poly([[5.8, 14.6, 3.2], [10, 14.6, 0.2], [10, 16.4, 0.2], [5.8, 16.4, 3.2]], SUN);
  g.line([[10.6, 19.6, 0], [10.6, 19.6, 3.4], [13.4, 19.6, 3.4], [13.4, 19.6, 0]], INK, 1);
  g.line([[11.6, 19.6, 3.4], [11.6, 19.6, 1.1]], INK, 0.8);
  g.line([[12.4, 19.6, 3.4], [12.4, 19.6, 1.1]], INK, 0.8);
  g.box(11.4, 19.2, 1, 1.2, 0.8, 0.25, CORAL);
  g.person(8, 18.6, 0, CORAL, { h: 0.68 });
  g.person(6.2, 20.4, 0, "#8DA8C9", { h: 0.62 });

  // 另一棟住宅與散步的親子
  g.box(17.5, 14, 0, 6, 4.6, 3.6, { top: WALL, left: WALL, right: "#EFE3CE" });
  g.gable(17.5, 14, 3.6, 6, 4.6, 2.4, "x", "#8DBFB1", WALL);
  g.windowsL(18.6, 18, 23, 1.2, 2.6, 2, GLASS);
  g.tree(26, 15.5, 0, 0.85);
  g.person(15.6, 21, 0, TEAL);
  g.person(16.8, 21.6, 0, SUN, { h: 0.64 });
  g.tree(3.4, 22.2, 0, 0.8);
  g.pine(22.5, 21.6, 0, 0.75);
}

function health(g: Iso) {
  g.slab(0, 0, 28, 22, 5, 3, "#DCEFE4", SIDE);
  g.flat(0.4, 11, 0, 27.2, 2.2, PATH, { sw: 0.8 });

  // 醫院
  g.box(2, 1.5, 0, 9, 8, 11, { top: "#F1F4EF", left: WALL, right: "#E8ECE6" });
  for (const z of [2, 4.8, 7.6]) {
    g.windowsL(9.5, 2.4, 10.6, z, z + 1.5, 3, GLASS);
    g.windowsR(11, 2, 9, z, z + 1.5, 2, GLASS);
  }
  g.winL(9.5, 2, 11, 10, 10.6, TEAL, { stroke: null });
  g.box(4.6, 4.4, 11, 2.6, 0.5, 2.6, WALL);
  g.winL(4.9, 5.65, 6.15, 11.35, 13.25, TEAL, { stroke: null });
  g.winL(4.9, 4.95, 6.85, 12.05, 12.55, TEAL, { stroke: null });
  g.box(4.4, 9.5, 2.3, 4.4, 1.6, 0.35, "#93D0B4");
  g.winL(9.5, 5.4, 7.8, 0, 2.3, GLASS);

  // 社區照顧據點（屋頂花園＋遮陽棚）
  g.box(15, 2.5, 0, 9.5, 6, 4, { top: WALL2, left: WALL2, right: "#EBDCC4" });
  g.flat(15.6, 3.1, 4, 8.3, 4.8, "#BFE3D0", { sw: 0.8 });
  g.tree(18, 5, 4, 0.45);
  g.tree(21.5, 5.8, 4, 0.5);
  g.windowsL(8.5, 15.4, 24.2, 1.1, 2.6, 3, GLASS);
  g.poly([[15, 8.5, 3.2], [24.5, 8.5, 3.2], [24.5, 10, 2.5], [15, 10, 2.5]], PEACH);
  g.windowsR(24.5, 3, 8, 1.1, 2.6, 2, GLASS);

  // 無障礙坡道與平台
  g.box(18, 14.2, 0, 7.4, 4.8, 1.2, WOOD);
  g.poly([[10, 14.8, 0], [18, 14.8, 1.2], [18, 16.6, 1.2], [10, 16.6, 0]], "#EED9B0");
  g.line([[10, 16.8, 1.3], [18, 16.8, 2.5], [25.4, 16.8, 2.5]], INK, 0.9);
  g.person(13.6, 16.2, 0.6, CORAL, { h: 0.85 });
  g.box(20, 15, 1.2, 3.6, 0.9, 0.7, "#C99C6E");
  g.person(21, 17.6, 1.2, "#8DA8C9", { hair: "#E8E4DA" });
  g.line([[22, 18, 1.2], [22.2, 18, 3]], INK, 0.8);

  // 花圃
  g.disk(4.8, 16.6, 0.02, 2.1, "#F7CDBB", { sw: 0.8 });
  for (const [fx, fy] of [[4, 15.8], [5.6, 16.2], [4.6, 17.6], [5.8, 17.4]]) g.disk(fx, fy, 0.05, 0.35, SUN, { sw: 0.6 });
  g.tree(2.6, 12.6, 0, 0.75);
  g.tree(9, 19.6, 0, 0.9);
  g.pine(26, 12.8, 0, 0.75);
}

function environment(g: Iso) {
  g.slab(0, 0, 30, 26, 5, 3, "#E1EFCF", SIDE);

  // 埤塘
  g.disk(9.5, 9.5, 0.01, 6.6, "#D8C99E", { sw: 0.9 });
  g.disk(9.5, 9.5, 0.03, 5.8, WATER, { sw: 0.9 });
  g.line([[7, 8, 0.05], [9.5, 8, 0.05]], "#FFFFFF", 1, "1 1.2");
  g.line([[9.5, 11.5, 0.05], [12.5, 11.5, 0.05]], "#FFFFFF", 1, "1 1.2");
  g.free(8, 10.4, 0.05, ([x, y]) => `M${x - 0.7} ${y}q0.7 -1 1.4 0z`, WALL, { sw: 0.7 });
  g.pine(3, 3, 0, 0.75);
  g.tree(16.2, 3.6, 0, 0.85);

  // 資源回收站＋太陽能板
  g.box(19, 2, 0, 8, 5, 3.6, { top: "#EEE8D8", left: WALL2, right: "#E9D9BF" });
  for (let i = 0; i < 3; i++) {
    const px = 19.5 + i * 2.5;
    g.poly([[px, 2.5, 3.65], [px + 2.2, 2.5, 3.65], [px + 2.2, 4.6, 4.5], [px, 4.6, 4.5]], "#5E8FA6", { sw: 0.8 });
  }
  g.winL(7, 21.6, 24.4, 0, 2.6, "#E6DFCF");
  g.box(19.4, 7.6, 0, 1.7, 1.3, 1.9, "#7FB0D6");
  g.box(21.6, 7.6, 0, 1.7, 1.3, 1.9, "#8CC47A");
  g.box(23.8, 7.6, 0, 1.7, 1.3, 1.9, SUN);

  // 風力發電
  g.line([[27, 12, 0], [27, 12, 13]], INK, 1.3);
  g.free(27, 12, 13, ([x, y]) => `M${x} ${y}L${x - 0.4} ${y - 5.2}L${x + 0.5} ${y - 5}Z M${x} ${y}L${x + 4.7} ${y + 2}L${x + 4.2} ${y + 2.8}Z M${x} ${y}L${x - 4.3} ${y + 2.9}L${x - 4.6} ${y + 2}Z`, WALL, { sw: 0.8 });
  g.free(27, 12, 13, ([x, y]) => `M${x - 0.55} ${y}a0.55 0.55 0 1 0 1.1 0a0.55 0.55 0 1 0 -1.1 0Z`, SUN, { sw: 0.8 });

  // 步道、慢跑的人、清運車
  g.flat(0.4, 17.2, 0, 29.2, 2.2, PATH, { sw: 0.8 });
  g.box(5.5, 15, 0, 3.2, 0.8, 0.8, WOOD);
  g.tree(17, 13.6, 0, 1);
  g.person(12, 18.2, 0, CORAL);
  g.person(15, 18.4, 0, TEAL, { h: 0.95 });
  g.box(21, 17.3, 0.3, 5.6, 2, 2.4, { top: WALL, left: "#8CC47A", right: shade("#8CC47A", -0.14) });
  g.winR(26.6, 17.6, 19, 1.4, 2.5, GLASS);
  for (const wx of [22.4, 25.4]) g.free(wx, 19.3, 0.3, ([x, y]) => `M${x - 0.7} ${y}a0.7 0.7 0 1 0 1.4 0a0.7 0.7 0 1 0 -1.4 0Z`, "#3E5E66");
  g.tree(4.4, 22.4, 0, 0.95);
  g.pine(9.6, 23, 0, 0.85);
  g.tree(14.6, 23, 0, 0.8);
  g.tree(22.5, 23.2, 0, 1);
}

function future(g: Iso) {
  g.slab(0, 0, 32, 26, 5, 3, "#FBEFC8", SIDE);
  g.flat(0.4, 12, 0, 31.2, 2.4, PATH, { sw: 0.8 });

  // 學校＋鐘塔
  g.box(2, 2, 0, 10, 6, 5.5, { top: "#F3EEE2", left: WALL, right: "#ECE3D0" });
  g.windowsL(8, 2.4, 11.6, 1.4, 3.6, 4, GLASS);
  g.box(5.5, 3, 5.5, 3, 3, 3.4, { top: WALL, left: WALL, right: "#ECE3D0" });
  g.gable(5.5, 3, 8.9, 3, 3, 1.8, "y", CORAL, WALL);
  g.free(7, 6, 7.2, ([x, y]) => `M${x - 0.85} ${y}a0.85 0.85 0 1 0 1.7 0a0.85 0.85 0 1 0 -1.7 0Z M${x} ${y}L${x} ${y - 0.6} M${x} ${y}L${x + 0.45} ${y + 0.2}`, WALL, { sw: 0.8 });
  g.line([[13.2, 9, 0], [13.2, 9, 7]], INK, 0.9);
  g.free(13.2, 9, 7, ([x, y]) => `M${x} ${y}L${x + 2.4} ${y + 0.7}L${x} ${y + 1.6}Z`, SUN, { sw: 0.8 });

  // 創新園區：辦公樓＋玻璃塔
  g.box(15, 3, 0, 5.5, 5, 8, { top: "#F4EEE0", left: WALL2, right: "#E9DCC4" });
  for (const z of [1.5, 4, 6.4]) g.windowsL(8, 15.3, 20.2, z, z + 1.2, 2, GLASS);
  g.box(22.5, 1.5, 0, 7, 7, 17, { top: "#E9F2F4", left: "#DCEBF0", right: "#C6DCE3" });
  for (let z = 1.4; z < 16; z += 2.3) {
    g.windowsL(8.5, 22.8, 29.2, z, z + 1.3, 3, "#F7FBFC");
    g.windowsR(29.5, 1.8, 8.2, z, z + 1.3, 3, "#F7FBFC");
  }
  g.line([[26, 5, 17], [26, 5, 20]], INK, 0.9);
  g.free(26, 5, 20, ([x, y]) => `M${x - 0.5} ${y}a0.5 0.5 0 1 0 1 0a0.5 0.5 0 1 0 -1 0Z`, CORAL, { sw: 0.7 });

  // 棒球場
  g.disk(9, 20, 0.02, 5.6, "#B9DC9A", { sw: 0.9 });
  g.poly([[9, 16.4, 0.04], [12.6, 20, 0.04], [9, 23.6, 0.04], [5.4, 20, 0.04]], "#E9C99A", { sw: 0.8 });
  g.disk(9, 20, 0.05, 1.3, "#B9DC9A", { sw: 0.7 });
  for (const [bx, by] of [[9, 16.4], [12.6, 20], [5.4, 20], [9, 23.6]] as [number, number][]) g.flat(bx - 0.35, by - 0.35, 0.06, 0.7, 0.7, WALL, { sw: 0.6 });
  g.person(9.6, 21.4, 0.05, CORAL, { h: 0.7 });

  // 商圈攤位
  g.box(18.5, 16, 0, 4.2, 3.6, 3, { top: WALL2, left: WALL2, right: "#EAD9BF" });
  g.poly([[18.5, 19.6, 2.6], [22.7, 19.6, 2.6], [22.7, 21, 1.9], [18.5, 21, 1.9]], SUN);
  g.box(24, 16.4, 0, 4.2, 3.6, 3, { top: WALL, left: WALL, right: "#EAD9BF" });
  g.poly([[24, 20, 2.6], [28.2, 20, 2.6], [28.2, 21.4, 1.9], [24, 21.4, 1.9]], CORAL);
  g.person(21, 22.6, 0, TEAL);
  g.person(26.4, 23, 0, "#8DA8C9", { h: 0.9 });
  g.tree(16, 22.6, 0, 0.85);
  g.pine(30, 12, 0, 0.7);
}

function hub(g: Iso) {
  g.slab(0, 0, 11, 11, 4, 2.4, "#F6F0E0", SIDE);
  g.disk(5.5, 5.5, 0.02, 3.2, PATH, { sw: 0.8 });
  g.cylinder(5.5, 5.5, 0, 2, 0.8, "#E9F4F6", WATER);
  g.line([[5.5, 5.5, 0.8], [5.5, 5.5, 2.4]], "#FFFFFF", 1.4);
  g.line([[8.5, 2.2, 0], [8.5, 2.2, 9]], INK, 1);
  g.free(8.5, 2.2, 9, ([x, y]) => `M${x} ${y}L${x + 3.4} ${y + 0.9}L${x} ${y + 2}Z`, SUN, { sw: 0.8 });
  g.line([[2.2, 8.5, 0], [2.2, 8.5, 4]], INK, 1);
  g.free(2.2, 8.5, 3.6, ([x, y]) => `M${x - 2.4} ${y - 0.3}L${x + 1.6} ${y - 0.3}L${x + 2.3} ${y + 0.35}L${x + 1.6} ${y + 1}L${x - 2.4} ${y + 1}Z`, TEAL, { sw: 0.8 });
  g.tree(9, 8.6, 0, 0.7);
}

export const islandDefs: Record<CategorySlug, IslandDef> = {
  transport: {
    w: 32,
    d: 26,
    screen: [-8, -22],
    anchor: [12, 5, 13],
    spots: [[13, 5, 10.8], [10, 13.5, 4.5], [24.5, 16.5, 0.5], [21.5, 9.6, 6]],
    draw: transport,
  },
  family: {
    w: 28,
    d: 24,
    screen: [-40, 30],
    anchor: [8, 5, 10],
    spots: [[8, 4.5, 7.6], [7.5, 17, 3.5], [20.5, 4, 6.4], [16, 21.4, 3]],
    draw: family,
  },
  health: {
    w: 28,
    d: 22,
    screen: [36, 28],
    anchor: [6.5, 5.5, 16],
    spots: [[6.5, 5.5, 14], [20, 5.5, 5], [13, 15.6, 2.6], [21.5, 17, 4.2]],
    draw: health,
  },
  environment: {
    w: 30,
    d: 26,
    screen: [70, -4],
    anchor: [17, 9, 11],
    spots: [[23, 4.5, 4.8], [9.5, 9.5, 0.5], [24, 18.3, 2.8], [17, 13.6, 5.5]],
    draw: environment,
  },
  future: {
    w: 32,
    d: 26,
    screen: [-76, 2],
    anchor: [26, 5, 21],
    spots: [[22, 18, 3.5], [17.8, 5.5, 8.4], [7, 5, 9.5], [9, 20, 1]],
    draw: future,
  },
};

const HUB: { w: number; d: number; screen: [number, number] } = { w: 11, d: 11, screen: [-2, 10] };

function originFor(screen: [number, number], w: number, d: number): [number, number] {
  const [cx, cy] = fromScreen(screen[0], screen[1]);
  return [cx - w / 2, cy - d / 2];
}

export type PinPos = { x: number; y: number };

export type SceneData = {
  shapes: Shape[];
  viewBox: IsoBounds;
  anchors: Record<CategorySlug, PinPos>;
  spots: Record<CategorySlug, PinPos[]>;
  /** 每座島在整張圖中的範圍（拉近鏡頭用） */
  frames: Record<CategorySlug, IsoBounds>;
};

const order: CategorySlug[] = ["transport", "environment", "future", "health", "family"];

function seaDecor(decor: Shape[]) {
  const wave = (x: number, y: number, s = 1) =>
    `M${x} ${y}q${1.2 * s} ${-1.2 * s} ${2.4 * s} 0t${2.4 * s} 0t${2.4 * s} 0`;
  const waves: [number, number, number][] = [
    [-104, 30, 1], [-86, 44, 0.8], [-10, 40, 0.9], [72, 30, 1], [92, 40, 0.8],
    [-46, -20, 0.8], [36, -32, 0.9], [-108, -18, 0.8], [96, -30, 0.8], [6, 50, 0.7],
  ];
  for (const [x, y, s] of waves) decor.push({ d: wave(x, y, s), fill: "none", stroke: "#7FB2C2", sw: 1.1, cap: "round" });

  // 連接各島的航線（虛線）
  const [hx, hy] = HUB.screen;
  for (const slug of order) {
    const [sx, sy] = islandDefs[slug].screen;
    const mx = (hx + sx) / 2 + (sy - hy) * 0.18;
    const my = (hy + sy) / 2 + 6;
    decor.push({ d: `M${hx} ${hy + 6}Q${mx} ${my} ${sx} ${sy + 8}`, fill: "none", stroke: "#FFFFFF", sw: 1.6, dash: "3 4", cap: "round" });
  }

  // 帆船
  const boat = (x: number, y: number, sail: string) =>
    decor.push(
      { d: `M${x - 3.4} ${y}L${x + 3.4} ${y}L${x + 2.3} ${y + 1.6}L${x - 2.3} ${y + 1.6}Z`, fill: WALL, stroke: INK },
      { d: `M${x - 0.2} ${y - 0.2}L${x - 0.2} ${y - 6}L${x + 3} ${y - 0.6}Z`, fill: sail, stroke: INK },
    );
  boat(-98, 50, SUN);
  boat(98, 18, CORAL);
  boat(-2, 50, "#8EC3D5");
}

function skyDecor(decor: Shape[], vb: IsoBounds) {
  const cloud = (x: number, y: number, s: number) =>
    `M${x} ${y}a${3 * s} ${3 * s} 0 0 1 ${5 * s} ${-2.4 * s}a${4 * s} ${4 * s} 0 0 1 ${7.4 * s} ${0.4 * s}a${3 * s} ${3 * s} 0 0 1 ${4.6 * s} ${3.2 * s}a${2 * s} ${2 * s} 0 0 1 ${-0.4 * s} ${3.6 * s}L${x + 0.4 * s} ${y + 4.8 * s}a${2.4 * s} ${2.4 * s} 0 0 1 ${-0.4 * s} ${-4.8 * s}Z`;
  decor.push({ d: cloud(vb.x + 18, vb.y + 12, 1.1), fill: "#FFFFFF", stroke: INK, sw: 1 });
  decor.push({ d: cloud(vb.x + vb.w - 52, vb.y + 22, 0.8), fill: "#FFFFFF", stroke: INK, sw: 1 });
  decor.push({ d: cloud(vb.x + vb.w * 0.36, vb.y + 6, 0.7), fill: "#FFFFFF", stroke: INK, sw: 1 });

  // 從桃園機場起飛的飛機
  const px = vb.x + vb.w - 34;
  const py = vb.y + 10;
  decor.push(
    { d: `M${px - 9} ${py + 4}L${px + 7} ${py - 3}Q${px + 10} ${py - 4.2} ${px + 10.6} ${py - 3}Q${px + 10.6} ${py - 1.6} ${px + 8} ${py - 0.6}L${px - 8} ${py + 6}Z`, fill: WALL, stroke: INK, sw: 1 },
    { d: `M${px - 1} ${py + 0.6}L${px - 6} ${py - 4}L${px - 3.6} ${py - 4.2}L${px + 3} ${py - 1}Z`, fill: "#8EC3D5", stroke: INK, sw: 1 },
    { d: `M${px} ${py + 1.8}L${px - 2.6} ${py + 8}L${px - 0.4} ${py + 7.8}L${px + 3.6} ${py + 0.4}Z`, fill: "#8EC3D5", stroke: INK, sw: 1 },
    { d: `M${px - 8} ${py + 4.6}L${px - 10.6} ${py}L${px - 9} ${py - 0.2}L${px - 6} ${py + 3.6}Z`, fill: SUN, stroke: INK, sw: 1 },
    { d: `M${px - 14} ${py + 9}l-7 3.2M${px - 20} ${py + 8}l-5 2.4`, fill: "none", stroke: "#FFFFFF", sw: 1.4, cap: "round" },
  );
  const bird = (x: number, y: number) => `M${x - 1.6} ${y - 0.6}q0.8 -0.2 1.6 0.6q0.8 -0.8 1.6 -0.6`;
  for (const [bx, by] of [[vb.x + 70, vb.y + 18], [vb.x + 76, vb.y + 22], [vb.x + vb.w - 86, vb.y + 34]]) {
    decor.push({ d: bird(bx, by), fill: "none", stroke: INK, sw: 1, cap: "round" });
  }
}

let cached: SceneData | undefined;

export function buildWorld(): SceneData {
  if (cached) return cached;
  const all = new Iso();
  const islandShapes: Shape[] = [];
  const anchors = {} as Record<CategorySlug, PinPos>;
  const spots = {} as Record<CategorySlug, PinPos[]>;
  const frames = {} as Record<CategorySlug, IsoBounds>;

  const drawOrder: (CategorySlug | "hub")[] = ["transport", "environment", "future", "hub", "health", "family"];
  for (const key of drawOrder) {
    if (key === "hub") {
      const [ox, oy] = originFor(HUB.screen, HUB.w, HUB.d);
      const g = new Iso(ox, oy);
      hub(g);
      islandShapes.push(...g.shapes);
      merge(all, g);
      continue;
    }
    const def = islandDefs[key];
    const [ox, oy] = originFor(def.screen, def.w, def.d);
    const g = new Iso(ox, oy);
    def.draw(g);
    islandShapes.push(...g.shapes);
    merge(all, g);
    frames[key] = boundsOf(g, 2);
    const a = project(def.anchor[0] + ox, def.anchor[1] + oy, def.anchor[2]);
    anchors[key] = { x: a[0], y: a[1] };
    spots[key] = def.spots.map(([x, y, z]) => {
      const p = project(x + ox, y + oy, z);
      return { x: p[0], y: p[1] };
    });
  }

  const vb = boundsOf(all, 10);
  vb.y -= 8;
  vb.h += 8;
  const decor: Shape[] = [];
  seaDecor(decor);
  skyDecor(decor, vb);

  cached = { shapes: [...decor, ...islandShapes], viewBox: vb, anchors, spots, frames };
  return cached;
}

function merge(into: Iso, g: Iso) {
  into.minX = Math.min(into.minX, g.minX);
  into.maxX = Math.max(into.maxX, g.maxX);
  into.minY = Math.min(into.minY, g.minY);
  into.maxY = Math.max(into.maxY, g.maxY);
}

const islandCache = new Map<CategorySlug, { shapes: Shape[]; viewBox: IsoBounds; spots: PinPos[] }>();

/** 單獨畫一座島（分類卡片、分類頁用） */
export function buildIsland(slug: CategorySlug) {
  const hit = islandCache.get(slug);
  if (hit) return hit;
  const def = islandDefs[slug];
  const g = new Iso();
  def.draw(g);
  const viewBox = boundsOf(g, 3);
  const spots = def.spots.map(([x, y, z]) => {
    const p = project(x, y, z);
    return { x: p[0], y: p[1] };
  });
  const out = { shapes: g.shapes, viewBox, spots };
  islandCache.set(slug, out);
  return out;
}
