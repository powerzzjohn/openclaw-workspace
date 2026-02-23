import { Request, Response } from 'express';
/**
 * 开始修炼
 * POST /api/v1/cultivate/start
 */
export declare const startCultivationHandler: (req: Request, res: Response) => Promise<void>;
/**
 * 结束修炼
 * POST /api/v1/cultivate/end
 */
export declare const endCultivationHandler: (req: Request, res: Response) => Promise<void>;
/**
 * 获取修炼历史
 * GET /api/v1/cultivate/history
 */
export declare const getCultivationHistoryHandler: (req: Request, res: Response) => Promise<void>;
/**
 * 获取修炼状态
 * GET /api/v1/cultivate/status
 */
export declare const getCultivationStatusHandler: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    startCultivationHandler: (req: Request, res: Response) => Promise<void>;
    endCultivationHandler: (req: Request, res: Response) => Promise<void>;
    getCultivationHistoryHandler: (req: Request, res: Response) => Promise<void>;
    getCultivationStatusHandler: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=cultivationController.d.ts.map