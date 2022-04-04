import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer} from 'react-navigation';

import MainStackNavigator from './MainStackNavigator';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/Register';
import SplashScreen from './screens/SplashScreen'

export const appStackNavigator = createStackNavigator(
    {
        SplashScreen: {
            screen: SplashScreen,
            navigationOptions: {
                headerShown: false,
            },
        },
        MainStackNavigator: {
            screen: MainStackNavigator,
        },
        LoginScreen: {
            screen: LoginScreen,
            navigationOptions: {
                headerShown: false,
            },
        },
        RegisterScreen: {
            screen: RegisterScreen,
            navigationOptions: {
                headerShown: false,
            },
        },
    },
    {
        initialRouteName: 'SplashScreen',
        mode: 'card',
        navigationOptions: {
            headerShown: false,
            gestureEnabled: false,
        },
    },
);

export default createAppContainer(appStackNavigator);
