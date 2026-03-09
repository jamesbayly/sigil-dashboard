#!/usr/bin/env python3
"""
Bulk export Polymarket trades for a list of market IDs.

Writes CSV files named: market_{marketId}_trades.csv

Columns (matching frontend exportCSV):
market_id,trade_id,transaction_hash,trade_date,user_id,user_name,user_trade_count,side,outcome,amount,price,current_price,current_profit,current_profit_percent

Usage examples:
  python scripts/export_polymarket_trades.py --markets 1,2,3 --base https://api.example.com
  python scripts/export_polymarket_trades.py --file markets.txt

If `--base` is not provided the script will read from environment variable `VITE_API_BASE_URL`.
"""

from __future__ import annotations
import csv
import json
import os
import time
from typing import List, Optional
import urllib.request
import urllib.error
import ssl

CSV_HEADER = [
    "market_id",
    "trade_id",
    "transaction_hash",
    "trade_date",
    "user_id",
    "user_name",
    "user_trade_count",
    "side",
    "outcome",
    "amount",
    "price",
    "current_price",
    "current_profit",
    "current_profit_percent",
]


def fetch_market(market_id: int, timeout: int = 10, retries: int = 3, backoff_factor: float = 0.5) -> Optional[dict]:
    url = f"https://sigil-api.bayly.xyz/polymarkets/{market_id}"
    ctx = ssl.create_default_context()
    attempt = 0
    while attempt <= retries:
        try:
            req = urllib.request.Request(
                url, headers={"Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
                status = getattr(resp, "status", None)
                raw = resp.read()
                if status is not None and status >= 400:
                    raise urllib.error.HTTPError(
                        url, status, f"HTTP {status}", hdrs=None, fp=None)  # type: ignore
                return json.loads(raw.decode("utf-8"))
        except (urllib.error.HTTPError, urllib.error.URLError, ValueError) as e:
            attempt += 1
            if attempt > retries:
                print(f"[ERROR] Failed to fetch market {market_id}: {e}")
                return None
            sleep = backoff_factor * (2 ** (attempt - 1))
            time.sleep(sleep)
        except Exception as e:
            print(f"[ERROR] Unexpected error fetching market {market_id}: {e}")
            return None


def ensure_outdir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def write_csv_for_market(outdir: str, market: dict) -> None:
    market_id = market.get("id")
    trades = market.get("significant_trades", [])
    filename = os.path.join(outdir, f"market_{market_id}_trades.csv")

    with open(filename, "w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(CSV_HEADER)

        for t in trades:
            row = [
                market_id,
                t.get("id"),
                t.get("transaction_hash"),
                t.get("trade_date"),
                t.get("user_id"),
                t.get("user_name") or "",
                t.get("user_trade_count"),
                t.get("side"),
                t.get("outcome"),
                t.get("amount"),
                t.get("price"),
                t.get("current_price") if t.get(
                    "current_price") is not None else "",
                t.get("current_profit") if t.get(
                    "current_profit") is not None else "",
                t.get("current_profit_percent") if t.get(
                    "current_profit_percent") is not None else "",
            ]
            writer.writerow(row)

    print(f"Wrote {filename} ({len(trades)} trades)")


def parse_market_list(markets_arg: Optional[str], file_path: Optional[str]) -> List[int]:
    ids: List[int] = []
    if markets_arg:
        for piece in markets_arg.split(","):
            piece = piece.strip()
            if piece:
                ids.append(int(piece))
    if file_path:
        with open(file_path, "r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                ids.append(int(line))
    # dedupe while preserving order
    seen = set()
    out = []
    for i in ids:
        if i not in seen:
            out.append(i)
            seen.add(i)
    return out


# === Simplified: hardcoded market IDs and single output file ===
# Edit the MARKET_IDS list below to include the markets you want to export.
MARKET_IDS: List[int] = [187, 188, 189, 191, 192, 193, 194, 195, 196, 197, 198, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 231, 233, 234, 235, 237, 238, 239, 241, 242, 243, 244, 245, 246, 247, 248, 253, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 270, 271, 272, 273, 274, 275, 277, 278, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 314, 315, 326, 329, 332, 338, 339, 341, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 363, 364, 365, 366, 367, 391, 392, 393, 394, 396, 409, 410, 411, 412, 413, 414, 415, 416, 417, 419, 420, 421, 422, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 437, 438, 439, 440, 441, 442, 443, 444, 447, 449, 478, 480, 481, 482, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 580, 581, 583, 584, 586, 587, 588, 589, 600, 601, 602, 603, 604, 605, 606, 607, 608, 609, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629, 640, 641, 642, 643, 645, 646, 647, 648, 649, 650, 651, 652, 654, 655, 656, 658, 659, 669, 670, 672, 673, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687, 688, 689, 690, 691, 699, 730, 733, 739, 742, 753, 754, 769, 794, 804, 805, 810, 811, 812, 817, 819, 826, 827, 830, 837, 838, 839, 841, 842, 843, 848, 850, 851, 853, 854, 855, 856, 884, 885, 886, 889, 890, 897, 902, 903, 904, 905, 915, 916, 918, 919, 920, 921, 922, 923, 924, 925, 927, 928, 929, 930, 932, 933, 935, 937, 938, 939, 940, 941, 942, 944, 945, 946, 947, 948, 949, 950, 951, 952, 953, 954, 955, 956, 957, 958, 959, 960, 962, 965, 966, 967, 984, 985, 987, 989, 997, 1000, 1002, 1013, 1019, 1021, 1022, 1023, 1024, 1026, 1027, 1028, 1029, 1030, 1034, 1035, 1037, 1038, 1039, 1040, 1041, 1044, 1045, 1046, 1049, 1053, 1055, 1062, 1072, 1079, 1080, 1081, 1082, 1084, 1086, 1087, 1088, 1092, 1093, 1095, 1097, 1100, 1101, 1103, 1106, 1107, 1112, 1139, 1153, 1162, 1167, 1168, 1169, 1171, 1185, 1186, 1227, 1228, 1266, 1267, 1303, 1304, 1307, 1309, 1310, 1311, 1312, 1313, 1314, 1315, 1317, 1318, 1320, 1321, 1322, 1323, 1324, 1325, 1326, 1349, 1350, 1351, 1352, 1353, 1354, 1356, 1357, 1358, 1388, 1554, 1556, 1557, 1558, 1559, 1561, 1562, 1563, 1564, 1565, 1566, 1567, 1568, 1569, 1579, 1615, 1616, 1617, 1618, 1619, 1620, 1621, 1622, 1623, 1630, 1631, 1632, 1633, 1636, 1637, 1641, 1646, 2394, 2395, 2396, 2397, 2398, 2399, 2400, 2401, 2408, 2409, 2410, 2411, 2412, 2413, 2414, 2416, 2417, 2419, 2420, 2421, 2422, 2423, 2424, 2425, 2426, 2427, 2428, 2429, 2430, 2431, 2432, 2433, 2434, 2435, 2436, 2438, 2439, 2440, 2441, 2446, 2447, 2450, 2451, 2453, 2454, 2455, 2456, 2457, 2458, 2459, 2460, 2461, 2462, 2463, 2464, 2465, 2466, 2467, 2468, 2469, 2470, 2471, 2472, 2479, 2481, 2482, 2485, 2486, 2487, 2489, 2490, 2491, 2492, 2501, 2502, 2504, 2505, 2506, 2507, 2508, 2509, 2510, 2511, 2525, 2528, 2531, 2545, 2546, 2547, 2548, 2549, 2550, 2551, 2552, 2553, 2554, 2555, 2557, 2558, 2561, 2562, 2563, 2564, 2565, 2566, 2567, 2568, 2571, 2572, 2573, 2574, 2575, 2576, 2577, 2578, 2579, 2580, 2581, 2582, 2583, 2584, 2585, 2586, 2587, 2588, 2589, 2590, 2591, 2592, 2593, 2594, 2595, 2596, 2597, 2598, 2599, 2600, 2601, 2602, 2603, 2604, 2605, 2606, 2607, 2608, 2609, 2610, 2611, 2612, 2613, 2614, 2615, 2616, 2617, 2618, 2619, 2620, 2621, 2622,
                         2623, 2625, 2626, 2629, 2630, 2631, 2632, 2633, 2634, 2635, 2640, 2641, 2642, 2643, 2644, 2646, 2647, 2648, 2650, 2652, 2653, 2657, 2660, 2664, 2665, 2666, 2677, 2683, 2684, 2685, 2688, 2689, 2691, 2692, 2693, 2696, 2697, 2698, 2699, 2701, 2703, 2715, 2716, 2717, 2718, 2719, 2722, 2723, 2724, 2727, 2728, 2729, 2737, 2738, 2766, 2767, 2768, 2769, 2770, 2771, 2772, 2773, 2775, 2780, 2781, 2784, 2785, 2786, 2787, 2788, 2789, 2790, 2791, 2792, 2796, 2797, 2805, 2806, 2807, 2809, 2810, 2833, 2834, 2836, 2837, 2838, 2839, 2844, 2845, 2846, 2847, 2848, 2850, 2852, 2853, 2856, 2858, 2859, 2860, 2861, 2862, 2863, 2864, 2866, 2867, 2868, 2869, 2870, 2871, 2872, 2873, 2877, 2878, 2879, 2883, 2886, 2887, 2888, 2889, 2890, 2891, 2892, 2893, 2894, 2896, 2898, 2899, 2901, 2902, 2904, 2907, 2908, 2909, 2910, 2912, 2921, 2924, 2926, 2928, 2929, 2930, 2931, 2932, 2935, 2936, 2939, 2947, 2949, 2950, 2952, 2953, 2954, 2955, 2956, 2957, 2959, 2960, 2961, 2962, 2963, 2964, 2965, 2966, 2967, 2968, 2969, 2970, 2974, 2975, 2979, 2980, 2981, 2982, 2983, 2984, 2985, 2986, 2987, 2988, 2989, 2990, 2991, 2992, 2993, 2994, 2995, 2996, 2997, 2998, 2999, 3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012, 3013, 3014, 3015, 3016, 3017, 3018, 3019, 3020, 3021, 3027, 3028, 3029, 3030, 3031, 3032, 3033, 3034, 3035, 3039, 3040, 3043, 3044, 3049, 3071, 3072, 3073, 3074, 3075, 3076, 3077, 3078, 3079, 3080, 3081, 3082, 3083, 3084, 3085, 3086, 3087, 3088, 3089, 3090, 3091, 3092, 3093, 3094, 3095, 3096, 3097, 3098, 3099, 3100, 3101, 3102, 3103, 3104, 3106, 3107, 3108, 3109, 3110, 3111, 3112, 3113, 3114, 3115, 3116, 3117, 3119, 3121, 3126, 3128, 3129, 3130, 3131, 3132, 3133, 3134, 3138, 3144, 3145, 3148, 3149, 3151, 3152, 3153, 3154, 3155, 3156, 3157, 3158, 3159, 3160, 3161, 3162, 3163, 3164, 3165, 3166, 3167, 3168, 3169, 3170, 3171, 3172, 3173, 3174, 3175, 3176, 3177, 3178, 3179, 3180, 3181, 3182, 3183, 3184, 3185, 3186, 3187, 3188, 3189, 3190, 3191, 3192, 3193, 3194, 3195, 3196, 3197, 3198, 3199, 3200, 3201, 3202, 3203, 3204, 3205, 3206, 3207, 3208, 3209, 3210, 3211, 3212, 3214, 3216, 3217, 3218, 3219, 3222, 3224, 3226, 3227, 3228, 3230, 3231, 3234, 3235, 3237, 3238, 3244, 3245, 3246, 3250, 3251, 3252, 3253, 3254, 3255, 3256, 3257, 3258, 3259, 3261, 3262, 3263, 3264, 3265, 3266, 3267, 3269, 3271, 3272, 3273, 3274, 3275, 3276, 3277, 3278, 3279, 3280, 3283, 3284, 3285, 3286, 3287, 3288, 3289, 3290, 3291, 3292, 3293, 3294, 3295, 3296, 3297, 3298, 3299, 3300, 3301, 3302, 3303, 3304, 3305, 3306, 3308, 3316, 3317, 3318, 3328, 3329, 3330, 3331, 3332, 3333, 3334, 3335, 3336, 3337, 3338, 3339, 3340, 3341, 3342, 3343, 3344, 3345, 3346, 3347, 3349, 3350, 3351, 3352, 3354, 3355, 3356, 3357, 3358, 3359, 3360, 3361, 3362, 3363, 3364, 3365, 3367, 3368, 3370, 3375, 3378, 3383, 3384, 3385, 3386, 3387, 3388, 3389, 3390, 3391, 3392, 3393, 3394, 3395, 3400, 3409, 3410, 3411, 3412, 3419, 3420, 3421, 3422, 3423, 3424, 3425, 3426, 3427, 3428, 3429, 3430, 3431, 3432, 3433, 3435, 3440, 3441, 3443, 3444, 3446, 3447, 3448, 3450, 3451, 3459, 3461, 3462, 3463, 3464, 3465, 3466, 3467, 3468, 3469, 3470, 3471, 3472, 3473, 3476, 3477, 3480, 3481, 3483, 3484, 3486, 3487, 3488, 3489, 3490, 3491, 3493, 3494, 3495, 3496, 3497, 3498, 3499, 3500, 3501, 3502, 3503, 3509, 3512, 3513, 3514, 3515, 3517, 3519, 3520, 3521, 3523, 3524, 3526, 3528, 3529, 3531, 3532, 3533, 3534, 3535, 3536, 3537, 3538, 3539, 3540, 3541, 3542, 3543, 3544, 3545, 3546, 3547, 3548, 3549, 3550, 3551, 3553, 3554, 3555, 3557, 3558, 3559, 3560, 3561, 3562, 3563, 3564, 3565, 3566, 3567, 3568, 3569, 3570, 3571, 3572]
OUTPUT_FILE = "polymarket_trades.csv"


def main() -> int:
    # Prepare output CSV
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as outfh:
        writer = csv.writer(outfh)
        writer.writerow(CSV_HEADER)

        for mid in MARKET_IDS:
            print(f"Fetching market {mid}...", end=" ")
            market = fetch_market(mid)
            if market is None:
                print("skipped")
                continue

            if not isinstance(market, dict):
                print("unexpected response shape, skipped")
                continue

            trades = market.get("significant_trades")
            if trades is None:
                print("no 'significant_trades' field, skipped")
                continue

            print(f"found {len(trades)} trades")

            for t in trades:
                row = [
                    market.get("id"),
                    t.get("id"),
                    t.get("transaction_hash"),
                    t.get("trade_date"),
                    t.get("user_id"),
                    t.get("user_name") or "",
                    t.get("user_trade_count"),
                    t.get("side"),
                    t.get("outcome"),
                    t.get("amount"),
                    t.get("price"),
                    t.get("current_price") if t.get(
                        "current_price") is not None else "",
                    t.get("current_profit") if t.get(
                        "current_profit") is not None else "",
                    t.get("current_profit_percent") if t.get(
                        "current_profit_percent") is not None else "",
                ]
                writer.writerow(row)

    print(f"Wrote {OUTPUT_FILE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
