import React from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Image,
} from 'react-native';

import { ResponsiveUtils, Colors } from '@common';
import Modal from './Modal';

const dynamicStyles = (isDarkMode) => {
  return StyleSheet.create({
    modal: {
      flex: 1,
      alignItems: 'flex-end',
    },
    container: {
      flex: 1,
      width: ResponsiveUtils.normalize(364),
      padding: 0,
      paddingVertical: ResponsiveUtils.normalize(24),
      marginHorizontal: 0,
      marginTop: 0,
      marginBottom: 0,
      borderRadius: 0,
    },
    headerWrapper: {
      marginLeft: ResponsiveUtils.normalize(24),
      marginRight: ResponsiveUtils.normalize(30),
    },
    list: {
      marginTop: ResponsiveUtils.normalize(30),
    },
    separatorImage: {
      height: ResponsiveUtils.normalize(1),
      backgroundColor: '#D8D8D8',
    },
    item: {
      marginLeft: ResponsiveUtils.normalize(24),
      marginRight: ResponsiveUtils.normalize(30),
      paddingVertical: ResponsiveUtils.normalize(20),
    },
    row: {
      flexDirection: 'row',
    },
    contentContainer: {
      marginTop: ResponsiveUtils.normalize(10),
    },
    time: {
      flex: 1,
      fontSize: ResponsiveUtils.normalize(12),
      color: '#74787C',
    },
    dotUnRead: {
      height: 10,
      width: 10,
      borderRadius: 6,
      backgroundColor: Colors.primaryColor.light,
    },
    icNotificationTypleWrapper: {
      marginRight: ResponsiveUtils.normalize(7),
      width: ResponsiveUtils.normalize(30),
      height: ResponsiveUtils.normalize(30),
      borderRadius: ResponsiveUtils.normalize(15),
      backgroundColor: '#EEEEEE',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icNotificationType: {
      width: ResponsiveUtils.normalize(16),
      height: ResponsiveUtils.normalize(16),
      resizeMode: 'contain',
    },
    massage: {
      fontSize: ResponsiveUtils.normalize(13),
      color: isDarkMode ? Colors.primaryTextColor.dark : Colors.primaryTextColor.light,
    }
  });
}

const ModalNotification = (props) => {
  const {
    visible,
    onRequestClose,
    isDarkMode,
    data,
  } = props;
  const styles = dynamicStyles(isDarkMode);

  renderRow = ({ item }) => (
    <TouchableOpacity style={styles.item}>
      <View style={styles.row}>
        <Text style={styles.time}>5 minutes ago</Text>
        <View style={styles.dotUnRead} />
      </View>
      <View style={[styles.row, styles.contentContainer]}>
        <View style={styles.icNotificationTypleWrapper}>
          <Image
            source={require('@assets/icons/ic_notification_person.png')}
            style={styles.icNotificationType}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.massage}>You have 1 new pending invoice from Pharmeedo App.</Text>
          <Text style={styles.massage}>Invoice number: 03 jan 2018</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      onRequestClose={onRequestClose}
      title="NOTIFICATION"
      isDarkMode={isDarkMode}
      modalStyle={styles.modal}
      containerStyle={styles.container}
      headerWrapper={styles.headerWrapper}
    >
      <FlatList
        style={styles.list}
        data={data}
        renderItem={renderRow}
        ItemSeparatorComponent={() => <View style={styles.separatorImage} />}
        keyExtractor={(item, index) => index.toString()}
      />
    </Modal>
  );
}

export default ModalNotification;
