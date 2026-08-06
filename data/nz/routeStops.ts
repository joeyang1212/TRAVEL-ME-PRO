export type RouteStop = {
  day: number;
  order: number;
  name: string;
  subtitle?: string;
  lat: number;
  lng: number;
};

export const nzRouteStops: RouteStop[] = [
  { day: 1, order: 1, name: "桃園國際機場", subtitle: "集合與出發", lat: 25.0797, lng: 121.2342 },
  { day: 1, order: 2, name: "奧克蘭", subtitle: "抵達紐西蘭", lat: -36.8509, lng: 174.7645 },

  { day: 2, order: 1, name: "奧克蘭機場", lat: -37.0082, lng: 174.7850 },
  { day: 2, order: 2, name: "基督城", lat: -43.5321, lng: 172.6362 },
  { day: 2, order: 3, name: "凱庫拉", subtitle: "海岸小鎮", lat: -42.4008, lng: 173.6814 },

  { day: 3, order: 1, name: "凱庫拉賞鯨碼頭", subtitle: "賞鯨行程", lat: -42.4010, lng: 173.6818 },
  { day: 3, order: 2, name: "漢默溫泉", lat: -42.5228, lng: 172.8294 },

  { day: 4, order: 1, name: "Monteith's Brewery", subtitle: "酒廠參觀", lat: -42.4504, lng: 171.2108 },
  { day: 4, order: 2, name: "Punakaiki Pancake Rocks", subtitle: "千層岩", lat: -42.1147, lng: 171.3262 },
  { day: 4, order: 3, name: "Greymouth", lat: -42.4504, lng: 171.2108 },

  { day: 5, order: 1, name: "West Coast Treetop Walk", subtitle: "樹冠步道", lat: -42.8583, lng: 170.8770 },
  { day: 5, order: 2, name: "Hokitika", subtitle: "霍基蒂卡", lat: -42.7167, lng: 170.9667 },
  { day: 5, order: 3, name: "Franz Josef Glacier", subtitle: "冰河區", lat: -43.3896, lng: 170.1833 },

  { day: 6, order: 1, name: "Lake Matheson", subtitle: "馬瑟森湖", lat: -43.4480, lng: 169.9660 },
  { day: 6, order: 2, name: "Wānaka", subtitle: "瓦納卡", lat: -44.6949, lng: 169.1417 },

  { day: 7, order: 1, name: "Cromwell", lat: -45.0387, lng: 169.2000 },
  { day: 7, order: 2, name: "Kinross Cellar Door", subtitle: "酒莊", lat: -45.0188, lng: 169.2625 },
  { day: 7, order: 3, name: "Arrowtown", subtitle: "箭鎮", lat: -44.9384, lng: 168.8298 },
  { day: 7, order: 4, name: "Queenstown", subtitle: "皇后鎮", lat: -45.0312, lng: 168.6626 },

  { day: 8, order: 1, name: "Milford Sound", subtitle: "米佛峽灣", lat: -44.6716, lng: 167.9256 },
  { day: 8, order: 2, name: "Lake Pukaki", subtitle: "普卡基湖", lat: -44.1778, lng: 170.1595 },
  { day: 8, order: 3, name: "Lake Tekapo", subtitle: "蒂卡波", lat: -44.0047, lng: 170.4771 },

  { day: 9, order: 1, name: "Aoraki / Mount Cook", subtitle: "庫克山", lat: -43.7340, lng: 170.0960 },
  { day: 9, order: 2, name: "Church of the Good Shepherd", subtitle: "好牧羊人教堂", lat: -44.0030, lng: 170.4817 },
  { day: 9, order: 3, name: "Christchurch", subtitle: "基督城", lat: -43.5321, lng: 172.6362 },

  { day: 10, order: 1, name: "Shamarra Alpacas", subtitle: "羊駝牧場", lat: -43.8060, lng: 172.9300 },
  { day: 10, order: 2, name: "Akaroa", subtitle: "阿卡羅阿", lat: -43.8037, lng: 172.9677 },
  { day: 10, order: 3, name: "Auckland", subtitle: "奧克蘭", lat: -36.8509, lng: 174.7645 },

  { day: 11, order: 1, name: "Auckland Airport", subtitle: "返程", lat: -37.0082, lng: 174.7850 },
  { day: 11, order: 2, name: "桃園國際機場", subtitle: "返回台灣", lat: 25.0797, lng: 121.2342 },
];
