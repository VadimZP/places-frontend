import Toast from "react-native-root-toast";

interface showToastProps {
    message: string;
    duration?: number;
    position?: number;
    backgroundColor?: string;
}

export function showToast({
    message,
    duration = Toast.durations.LONG,
    position = 40,
    backgroundColor }: showToastProps) {
    Toast.show(message, {
        duration,
        position,
        backgroundColor
    });
}