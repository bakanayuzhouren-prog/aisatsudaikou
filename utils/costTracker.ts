
const STORAGE_KEY = 'gemini_budget_tracker_v1';
const MONTHLY_LIMIT = 500; // 500円

// コスト設定（円）
// 安全マージンを含めて少し高めに設定
export const COSTS = {
    IMAGE: 7, // 約$0.039 -> 5.85円 -> マージン込み 7円
    TEXT: 0.5, // ほぼ無料だが念のため0.5円
};

interface BudgetData {
    month: string; // YYYY-MM format
    totalCost: number;
}

const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getUsage = (): BudgetData => {
    const currentMonth = getCurrentMonth();
    const saved = localStorage.getItem(STORAGE_KEY);

    let data: BudgetData = { month: currentMonth, totalCost: 0 };

    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // 月が変わっていたらリセット
            if (parsed.month !== currentMonth) {
                data = { month: currentMonth, totalCost: 0 };
                saveUsage(data);
            } else {
                data = parsed;
            }
        } catch (e) {
            console.error("Budget parse error", e);
        }
    } else {
        saveUsage(data);
    }

    return data;
};

const saveUsage = (data: BudgetData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const checkBudget = (additionalCost: number): boolean => {
    const usage = getUsage();
    return (usage.totalCost + additionalCost) <= MONTHLY_LIMIT;
};

export const addCost = (cost: number) => {
    const usage = getUsage();
    usage.totalCost += cost;
    // 小数点エラー防止のため整数で扱うのがベストだが、表示用なので簡易的に
    usage.totalCost = Math.round(usage.totalCost * 100) / 100;
    saveUsage(usage);
    return usage.totalCost;
};

export const getRemainingBudget = () => {
    const usage = getUsage();
    return Math.max(0, MONTHLY_LIMIT - usage.totalCost);
}
