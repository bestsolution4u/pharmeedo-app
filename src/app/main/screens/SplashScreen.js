import React from 'react';
import {Platform, StyleSheet, View, Image} from 'react-native';
import {NavigationActions, StackActions} from "react-navigation";
import {Config} from '@common';

class SplashScreen extends React.Component {
    componentDidMount() {
        const {navigation} = this.props;
        setTimeout(function () {
            const resetAction = StackActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({routeName: 'LoginScreen'}),
                ],
            });
            navigation.dispatch(resetAction);
        }, 3000);
    }

    render() {
        return (
            <View style={styles.container}>
                <Image source={Config.logo} style={styles.logo}/>
            </View>
        );
    }
}

const styles = StyleSheet.create(
    {
        container:
            {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: (Platform.OS === 'ios') ? 20 : 0,
                backgroundColor: 'white'
            },
        logo: {
            width: '50%',
            height: '50%',
            resizeMode: 'contain',
        },
    });

export default SplashScreen;
