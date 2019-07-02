// Generated by BUCKLESCRIPT VERSION 5.0.4, PLEASE EDIT WITH CARE

import * as Curry from "bs-platform/lib/es6/curry.js";
import * as Ramda from "ramda";
import * as Js_dict from "bs-platform/lib/es6/js_dict.js";
import * as Caml_array from "bs-platform/lib/es6/caml_array.js";
import * as Caml_option from "bs-platform/lib/es6/caml_option.js";
import * as Utils$Coronate from "./Utils.bs.js";

function isNotDummy(scoreDict, oppId) {
  var match = Js_dict.get(scoreDict, oppId);
  if (match !== undefined) {
    return !Caml_option.valFromOption(match).isDummy;
  } else {
    return true;
  }
}

function getPlayerScore(scoreDict, id) {
  var match = Js_dict.get(scoreDict, id);
  if (match !== undefined) {
    return Utils$Coronate.arraySumFloat(Caml_option.valFromOption(match).results);
  } else {
    return 0.0;
  }
}

function getOpponentScores(scoreDict, id) {
  var match = Js_dict.get(scoreDict, id);
  if (match !== undefined) {
    return Object.keys(Caml_option.valFromOption(match).opponentResults).filter((function (param) {
                    return isNotDummy(scoreDict, param);
                  })).map((function (param) {
                  return getPlayerScore(scoreDict, param);
                }));
  } else {
    return /* array */[];
  }
}

function getMedianScore(scoreDict, id) {
  return Utils$Coronate.arraySumFloat(Ramda.sort((function (param, param$1) {
                      return Ramda.ascend((function (x) {
                                    return x;
                                  }), param, param$1);
                    }), getOpponentScores(scoreDict, id)).slice(1, -1));
}

function getSolkoffScore(scoreDict, id) {
  return Utils$Coronate.arraySumFloat(getOpponentScores(scoreDict, id));
}

function runningReducer(acc, score) {
  return acc.concat(/* array */[Utils$Coronate.last(acc) + score]);
}

function getCumulativeScore(scoreDict, id) {
  var match = Js_dict.get(scoreDict, id);
  if (match !== undefined) {
    return Utils$Coronate.arraySumFloat(Caml_option.valFromOption(match).resultsNoByes.reduce(runningReducer, /* array */[0.0]));
  } else {
    return 0.0;
  }
}

function getCumulativeOfOpponentScore(scoreDict, id) {
  var match = Js_dict.get(scoreDict, id);
  if (match !== undefined) {
    return Utils$Coronate.arraySumFloat(Object.keys(Caml_option.valFromOption(match).opponentResults).filter((function (param) {
                        return isNotDummy(scoreDict, param);
                      })).map((function (param) {
                      return getCumulativeScore(scoreDict, param);
                    })));
  } else {
    return 0.0;
  }
}

function getColorBalanceScore(scoreDict, id) {
  var match = Js_dict.get(scoreDict, id);
  if (match !== undefined) {
    return Utils$Coronate.arraySumFloat(Caml_option.valFromOption(match).colorScores);
  } else {
    return 0.0;
  }
}

var tieBreakMethods = /* array */[
  {
    func: getMedianScore,
    id: 0,
    name: "Median"
  },
  {
    func: getSolkoffScore,
    id: 1,
    name: "Solkoff"
  },
  {
    func: getCumulativeScore,
    id: 2,
    name: "Cumulative score"
  },
  {
    func: getCumulativeOfOpponentScore,
    id: 3,
    name: "Cumulative of opposition"
  },
  {
    func: getColorBalanceScore,
    id: 4,
    name: "Most black"
  }
];

function getNamefromIndex(index) {
  return Caml_array.caml_array_get(tieBreakMethods, index).name;
}

function getTieBreakNames(idList) {
  return idList.map(getNamefromIndex);
}

function createBlankScoreData(id) {
  return {
          colorScores: /* array */[],
          colors: /* array */[],
          id: id,
          isDummy: false,
          opponentResults: { },
          ratings: /* array */[],
          results: /* array */[],
          resultsNoByes: /* array */[]
        };
}

function createStandingList(methods, scoreData) {
  var selectedTieBreakFuncs = methods.map((function (i) {
          return Caml_array.caml_array_get(tieBreakMethods, i).func;
        }));
  var standings = Object.keys(scoreData).map((function (id) {
          return {
                  id: id,
                  score: getPlayerScore(scoreData, id),
                  tieBreaks: selectedTieBreakFuncs.map((function (func) {
                          return Curry._2(func, scoreData, id);
                        }))
                };
        }));
  var sortTieBreakFuncList = selectedTieBreakFuncs.map((function (param, index) {
          return (function (param, param$1) {
              return Ramda.descend((function (x) {
                            return Caml_array.caml_array_get(x.tieBreaks, index);
                          }), param, param$1);
            });
        }));
  var sortFuncList = /* array */[(function (param, param$1) {
          return Ramda.descend((function (x) {
                        return x.score;
                      }), param, param$1);
        })].concat(sortTieBreakFuncList);
  return Ramda.sortWith(sortFuncList, standings);
}

function areScoresEqual(standing1, standing2) {
  var equalScores = standing1.score !== standing2.score;
  if (equalScores) {
    return false;
  } else {
    return !standing1.tieBreaks.reduce((function (acc, value, i) {
                    return /* array */[value !== Caml_array.caml_array_get(standing2.tieBreaks, i)].concat(acc);
                  }), /* array */[]).includes(true);
  }
}

function createStandingTree(standingList) {
  return standingList.reduce((function (acc, standing, i) {
                var match = i === 0;
                var isNewRank = match ? true : !areScoresEqual(standing, Caml_array.caml_array_get(standingList, i - 1 | 0));
                if (isNewRank) {
                  return acc.concat(/* array */[/* array */[standing]]);
                } else {
                  var lastIndex = acc.length - 1 | 0;
                  Caml_array.caml_array_set(acc, lastIndex, Caml_array.caml_array_get(acc, lastIndex).concat(/* array */[standing]));
                  return acc;
                }
              }), /* array */[]);
}

export {
  isNotDummy ,
  getPlayerScore ,
  getOpponentScores ,
  getMedianScore ,
  getSolkoffScore ,
  runningReducer ,
  getCumulativeScore ,
  getCumulativeOfOpponentScore ,
  getColorBalanceScore ,
  tieBreakMethods ,
  getNamefromIndex ,
  getTieBreakNames ,
  createBlankScoreData ,
  createStandingList ,
  areScoresEqual ,
  createStandingTree ,
  
}
/* ramda Not a pure module */
