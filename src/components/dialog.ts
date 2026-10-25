import { Alert, Platform } from 'react-native';

// Alert.alert does nothing on the web, so use the browser's dialogs there.
export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

export function confirmAction(title: string, message: string, onOk: () => void, okLabel = 'OK') {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onOk();
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: okLabel, onPress: onOk },
    ]);
  }
}
