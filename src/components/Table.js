import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import {get, property} from 'lodash';

import {ResponsiveUtils, Colors, ThemeUtils} from '@common';
import I18n from '@common/I18n';

const dynamicStyles = (isDarkMode) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: ResponsiveUtils.normalize(8),
      paddingVertical: ResponsiveUtils.normalize(2),
      backgroundColor: isDarkMode
        ? Colors.containerBgColor.dark
        : Colors.containerBgColor.light,
    },
    column: {
      flex: 1,
      paddingLeft: ResponsiveUtils.normalize(24),
    },
    tableHeader: {
      ...ThemeUtils.fontMaker({weight: '600'}),
    },
    textStyle: {
      marginVertical: ResponsiveUtils.normalize(10),
      color: isDarkMode
        ? Colors.primaryTextColor.dark
        : Colors.primaryTextColor.light,
      fontSize: ResponsiveUtils.normalize(16),
      ...ThemeUtils.fontMaker({weight: '400'}),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    btnAction: {
      paddingVertical: ResponsiveUtils.normalize(6),
      paddingHorizontal: ResponsiveUtils.normalize(8),
      backgroundColor: '#FF5066',
      borderRadius: 2,
      marginRight: ResponsiveUtils.normalize(16),
    },
    btnEdit: {
      backgroundColor: '#FFC31E',
    },
    lbAction: {
      paddingHorizontal: ResponsiveUtils.normalize(10),
      fontSize: ResponsiveUtils.normalize(14),
      color: '#FFF',
      ...ThemeUtils.fontMaker({weight: '500'}),
    },
    icAction: {
      width: ResponsiveUtils.normalize(20),
      height: ResponsiveUtils.normalize(20),
      resizeMode: 'contain',
    },
    image: {
      height: ResponsiveUtils.normalize(46),
      width: ResponsiveUtils.normalize(46),
      resizeMode: 'contain',
    },
  });
};

const Table = (props) => {
  const {
    isDarkMode,
    rowStyle,
    configs,
    data,
    onPressItem,
    disableOnPressItem = true,
    handlePressAction = () => {},
    currency,
  } = props;
  const styles = dynamicStyles(isDarkMode);

  const renderActions = ({config, index, onPressAction}) => (
    <View style={[styles.column, config.comlumnStyle]} key={index.toString()}>
      <TouchableWithoutFeedback>
        <View style={styles.row}>
          {config.actions.map((action, index) => {
            if (action === 'edit') {
              return (
                <TouchableOpacity
                  onPress={() => onPressAction({type: action})}
                  style={[styles.row, styles.btnAction, styles.btnEdit]}
                  key={index.toString()}>
                  <Image
                    source={require('@assets/icons/ic_edit_white.png')}
                    style={styles.icAction}
                  />
                  <Text style={styles.lbAction}>Edit</Text>
                </TouchableOpacity>
              );
            }
            if (action === 'delete') {
              return (
                <TouchableOpacity
                  onPress={() => onPressAction({type: action})}
                  style={[styles.row, styles.btnAction]}
                  key={index.toString()}>
                  <Image
                    source={require('@assets/icons/ic_delete.png')}
                    style={styles.icAction}
                  />
                  <Text style={styles.lbAction}>Delete</Text>
                </TouchableOpacity>
              );
            }
          })}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );

  const renderColumn = ({config, item, index, onPressAction}) => {
    if (config.actions) {
      return renderActions({config, index, onPressAction});
    }

    let value = '';
    const properties = config.property.split('&');
    properties.forEach((p, i) => {
      if (i === properties.length - 1) {
        value += get(item, p, '');
      } else {
        value += get(item, p, '') + ' ';
      }
    });
    if (config.format) {
      value = config.format(value, currency);
    }

    if (config.isImage) {
      return (
        <View
          style={[styles.column, config.comlumnStyle]}
          key={index.toString()}>
          {!!value && <Image source={{uri: value}} style={styles.image} />}
        </View>
      );
    }

    return (
      <View style={[styles.column, config.comlumnStyle]} key={index.toString()}>
        <Text style={[styles.textStyle, config.textStyle]}>{value}</Text>
      </View>
    );
  };

  const renderRow = ({item}) => (
    <TouchableOpacity
      style={[styles.tableRow, rowStyle]}
      disabled={disableOnPressItem}
      onPress={() => onPressItem({item})}>
      {configs.map((config, index) => {
        return renderColumn({
          config,
          item,
          index,
          onPressAction: ({type}) => handlePressAction({type, item}),
        });
      })}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tableRow}>
        {configs.map((item, index) => (
          <View
            style={[styles.column, item.comlumnStyle]}
            key={index.toString()}>
            <Text
              style={[styles.textStyle, styles.tableHeader, item.textStyle]}>
              {I18n.t(item.header)}
            </Text>
          </View>
        ))}
      </View>
      <FlatList
        data={data}
        renderItem={renderRow}
        keyExtractor={(item, index) => index.toString()}
        {...props}
      />
    </View>
  );
};

export default Table;
