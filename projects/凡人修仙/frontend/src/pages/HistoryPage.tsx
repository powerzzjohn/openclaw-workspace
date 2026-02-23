import React, { useState, useEffect } from 'react';
import { cultivationApi } from '../services/api';
import { 
  History, 
  Clock, 
  TrendingUp, 
  Cloud,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Award
} from 'lucide-react';
import type { CultivationLog } from '../types';

const HistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<CultivationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    totalExp: 0,
    averageBonus: 0,
  });

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await cultivationApi.getHistory(page, 10);
      if (response.success && response.data) {
        setLogs(response.data.logs);
        setTotalPages(response.data.pagination.totalPages);
        
        // 计算统计
        const allLogs = response.data.logs;
        const totalExp = allLogs.reduce((sum, log) => sum + log.expGained, 0);
        const totalMinutes = allLogs.reduce((sum, log) => sum + log.duration, 0);
        const avgBonus = allLogs.length > 0 
          ? allLogs.reduce((sum, log) => sum + log.bonusApplied, 0) / allLogs.length 
          : 0;
        
        setStats({
          totalSessions: response.data.pagination.total,
          totalMinutes,
          totalExp,
          averageBonus: avgBonus,
        });
      }
    } catch (err) {
      console.error('获取修炼历史失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-xiu-dark via-xiu-navy to-xiu-dark">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold xiu-title mb-2">修炼记录</h1>
          <p className="text-gray-400">回顾修炼历程，见证成长轨迹</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="xiu-card rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <History className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm text-gray-400">修炼次数</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalSessions}</div>
            <div className="text-xs text-gray-500 mt-1">次</div>
          </div>

          <div className="xiu-card rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm text-gray-400">累计时长</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatDuration(stats.totalMinutes)}</div>
            <div className="text-xs text-gray-500 mt-1">总计</div>
          </div>

          <div className="xiu-card rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-sm text-gray-400">获得修为</span>
            </div>
            <div className="text-2xl font-bold text-xiu-gold">{stats.totalExp}</div>
            <div className="text-xs text-gray-500 mt-1">经验点</div>
          </div>

          <div className="xiu-card rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-gray-400">平均加成</span>
            </div>
            <div className="text-2xl font-bold text-xiu-cyan">{stats.averageBonus.toFixed(2)}x</div>
            <div className="text-xs text-gray-500 mt-1">天时加成</div>
          </div>
        </div>

        {/* 记录列表 */}
        <div className="xiu-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-xiu-gold/20">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-xiu-gold" />
              <span className="font-semibold text-white">修炼明细</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-xiu-gold" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-xiu-gold/10 flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-xiu-gold" />
              </div>
              <p className="text-gray-400">暂无修炼记录</p>
              <p className="text-sm text-gray-500 mt-2">开始修炼，记录你的修仙之路</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-xiu-gold/10">
                {logs.map((log) => (
                  <div key={log.id} className="p-6 hover:bg-xiu-gold/5 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm text-gray-400">{formatDate(log.startTime)}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-xiu-gold/10 text-xiu-gold">
                            {log.city}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs">
                            <Cloud className="w-3 h-3" />
                            <span>{log.weather}</span>
                          </span>
                          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-xs">
                            <span>{log.wuYun}</span>
                          </span>
                          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs">
                            <span>{log.liuQi}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-400">时长</div>
                          <div className="font-semibold text-white">{formatDuration(log.duration)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-400">加成</div>
                          <div className="font-semibold text-xiu-cyan">{log.bonusApplied.toFixed(2)}x</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-400">修为</div>
                          <div className="font-semibold text-xiu-gold">+{log.expGained}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-xiu-gold/20 flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg text-gray-400 hover:text-xiu-gold hover:bg-xiu-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-gray-400">
                    第 {page} / {totalPages} 页
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg text-gray-400 hover:text-xiu-gold hover:bg-xiu-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
