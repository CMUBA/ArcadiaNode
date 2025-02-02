#!/bin/bash

# 启动所有服务
start_all() {
    echo "Starting all services..."
    
    # 启动客户端
    cd client && pnpm dev &
    
    # 启动服务端
    cd ../server && pnpm dev &
    
    # 等待所有后台进程
    wait
}

# 停止所有服务
stop_all() {
    echo "Stopping all services..."
    pkill -f "pnpm dev"
}

# 清理
cleanup() {
    stop_all
    exit 0
}

# 设置清理钩子
trap cleanup SIGINT SIGTERM

# 主函数
main() {
    case "$1" in
        "start")
            start_all
            ;;
        "stop")
            stop_all
            ;;
        *)
            echo "Usage: $0 {start|stop}"
            exit 1
            ;;
    esac
}

main "$@"
