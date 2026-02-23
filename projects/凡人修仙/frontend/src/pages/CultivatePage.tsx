import React, { useState, useEffect, useCallback } from 'react';
import { cultivationApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sparkles, 
  Play, 
  Square, 
  Wind, 
  Cloud,
  Thermometer,
  Moon,
  Activity,
  Clock,
  TrendingUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import type { TianShi, CultivationStatus } from '../types';
import { REALM_LIST } from '../types';

const CultivatePage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<CultivationStatus | null>(null);
  const [tianShi, setTianShi] = useState<TianShi | null>(null);
  const [isCultivating, setIsCultivating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [city, setCity] = useState('北京');

  // 获取修炼状态
  const fetchStatus = useCallback(async () => {
    try {
      const response = await cultivationApi.getStatus();
      if (response.success && response.data) {
        setStatus(response.data.cultivation);
        setIsCultivating(response.data.cultivation.isCultivating);
        if (response.data.cultivation.cultivateStartAt) {
          const startTime = new Date(response.data.cultivation.cultivateStartAt).getTime();
          const now = Date.now();
          setElapsedTime(Math.floor((now - startTime) / 1000));
        }
      }
    } catch (err) {
      console.error('获取修炼状态失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // 计时器
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCultivating) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCultivating]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCultivation = async () => {
    setIsActionLoading(true);
    setError('');
    try {
      const response = await cultivationApi.start(city);
      if (response.success && response.data) {
        setIsCultivating(true);
        setTianShi(response.data.cultivation.tianShi);
        setElapsedTime(0);
        setResult(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '开始修炼失败');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEndCultivation = async () => {
    setIsActionLoading(true);
    setError('');
    try {
      const response = await cultivationApi.end();
      if (response.success && response.data) {
        setIsCultivating(false);
        setResult(response.data.result);
        setElapsedTime(0);
        setStatus(response.data.result.cultivation);
        refreshUser();
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '结束修炼失败');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-xiu-gold" />
      </div>
    );
  }

  const nextRealm = REALM_LIST.find(r => r.realm === (status?.realm || 1) + 1);
  const progressPercent = nextRealm
    ? ((status?.currentExp || 0) / nextRealm.requiredExp) * 100
    : 100;

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-xiu-dark via-xiu-navy to-xiu-dark">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold xiu-title mb-2">修炼大厅</h1>
          <p className="text-gray-400">顺应天时，吐纳灵气，提升修为</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：修炼状态 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 修炼主面板 */}
            <div className="xiu-card rounded-2xl p-8 relative overflow-hidden">
              {/* 背景灵气效果 */}
              {isCultivating && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-xiu-cyan/5 to-transparent animate-pulse-slow"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-xiu-cyan/10 rounded-full blur-3xl animate-pulse"></div>
                </>
              )}

              <div className="relative">
                {/* 境界信息 */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-xiu-gold/10 border border-xiu-gold/30 mb-4">
                    <Sparkles className="w-4 h-4 text-xiu-gold" />
                    <span className="text-xiu-gold font-medium">{status?.realmName || '炼气'}</span>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {formatTime(elapsedTime)}
                  </div>
                  <p className="text-gray-400">{isCultivating ? '修炼中...' : '未开始修炼'}</p>
                </div>

                {/* 进度条 */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">当前修为</span>
                    <span className="text-xiu-gold">{status?.currentExp || 0} / {nextRealm?.requiredExp || '∞'}</span>
                  </div>
                  <div className="h-3 bg-xiu-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-xiu-gold to-xiu-goldLight rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{status?.realmName || '炼气'}</span>
                    <span>{nextRealm?.name || '已满级'}</span>
                  </div>
                </div>

                {/* 控制按钮 */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {!isCultivating ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="输入城市"
                          className="xiu-input w-32 text-center"
                        />
                      </div>
                      <button
                        onClick={handleStartCultivation}
                        disabled={isActionLoading}
                        className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 disabled:opacity-50"
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            <span>开始修炼</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEndCultivation}
                      disabled={isActionLoading}
                      className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50"
                    >
                      {isActionLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Square className="w-5 h-5" />
                          <span>结束修炼</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 修炼结果 */}
            {result && (
              <div className="xiu-card rounded-2xl p-6 border-green-500/30 bg-green-500/5">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-green-400">修炼成果</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-xiu-dark/50 rounded-lg">
                    <div className="text-2xl font-bold text-xiu-gold">{result.duration}</div>
                    <div className="text-xs text-gray-400">修炼时长(分)</div>
                  </div>
                  <div className="text-center p-4 bg-xiu-dark/50 rounded-lg">
                    <div className="text-2xl font-bold text-xiu-gold">{result.expGained}</div>
                    <div className="text-xs text-gray-400">获得修为</div>
                  </div>
                  <div className="text-center p-4 bg-xiu-dark/50 rounded-lg">
                    <div className="text-2xl font-bold text-xiu-cyan">{result.bonusApplied.toFixed(2)}x</div>
                    <div className="text-xs text-gray-400">总加成</div>
                  </div>
                  <div className="text-center p-4 bg-xiu-dark/50 rounded-lg">
                    <div className="text-2xl font-bold text-xiu-gold">{result.baseExp}</div>
                    <div className="text-xs text-gray-400">基础修为</div>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  {result.tianShiDetails.map((detail: string, index: number) => (
                    <div key={index} className="text-sm text-gray-400 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-xiu-gold"></span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
                {result.levelUp && (
                  <div className="mt-4 p-4 bg-xiu-gold/20 rounded-lg border border-xiu-gold/30 text-center">
                    <div className="text-xiu-gold font-bold">🎉 恭喜突破！晋升{result.newRealm?.realmName}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 右侧：天时信息 */}
          <div className="space-y-6">
            {/* 天时面板 */}
            <div className="xiu-card rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Wind className="w-5 h-5 text-xiu-cyan" />
                <span className="font-semibold text-white">天时地利</span>
              </div>

              {tianShi || isCultivating ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-xiu-dark/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Cloud className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-400">天气</span>
                    </div>
                    <span className="text-white">{(tianShi || status as any)?.weather || '晴'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-xiu-dark/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-gray-400">温度</span>
                    </div>
                    <span className="text-white">{(tianShi || status as any)?.temperature || 20}°C</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-xiu-dark/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Wind className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">五运</span>
                    </div>
                    <span className="text-white text-sm">{(tianShi || status as any)?.wuYun || '水运太过'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-xiu-dark/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-400">六气</span>
                    </div>
                    <span className="text-white text-sm">{(tianShi || status as any)?.liuQi || '太阳寒水'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-xiu-dark/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-400">子午流注</span>
                    </div>
                    <span className="text-white">{(tianShi || status as any)?.ziWuMeridian || '脾经'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-xiu-dark/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Moon className="w-4 h-4 text-blue-300" />
                      <span className="text-sm text-gray-400">月相</span>
                    </div>
                    <span className="text-white">{(tianShi || status as any)?.moonPhase || '残月'}</span>
                  </div>

                  <div className="p-4 bg-xiu-gold/10 rounded-lg border border-xiu-gold/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">天时加成</span>
                      <span className="text-xl font-bold text-xiu-gold">{(tianShi || status as any)?.totalBonus?.toFixed(2) || 1.0}x</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Wind className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>开始修炼后显示天时信息</p>
                </div>
              )}
            </div>

            {/* 修炼统计 */}
            <div className="xiu-card rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Activity className="w-5 h-5 text-xiu-gold" />
                <span className="font-semibold text-white">修炼统计</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">累计修炼</span>
                  <span className="text-xiu-gold">{status?.totalDays || 0} 天</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">连续修炼</span>
                  <span className="text-xiu-gold">{status?.streakDays || 0} 天</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">今日修炼</span>
                  <span className="text-xiu-gold">{status?.todayMinutes || 0} 分钟</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">总修为</span>
                  <span className="text-xiu-gold">{status?.totalExp || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CultivatePage;
