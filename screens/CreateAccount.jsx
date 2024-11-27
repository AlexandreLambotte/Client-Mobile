import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';


export default function Profile() {
    const navigation = useNavigation();

    return (
        <View style={[styles.container]}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Image source={require('../images/logo.png')} style={styles.logo} />
            </TouchableOpacity>
            <Text style={styles.appName}>WalkThrough</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 20 }}>CreateAccount</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2D2D2D',
    },
    logo: {
        width: 150,
        height: 150,
        marginTop: -50,
        marginBottom: 0,
    },
    appName: {
        fontFamily: 'ZenDots',
        fontSize: 32,
        color: '#FFD941',
        marginBottom: 100,
    },
});