import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Image, Alert} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useDynamicStyleSheet} from 'react-native-dark-mode';
import ToggleSwitch from 'toggle-switch-react-native';

import {ActionCreators} from '@actions';
import Table from '@components/Table';
import ModalSelect from '@components/ModalSelect';
import I18n from '@common/I18n';
import {languages} from '@common/data/Languages';
import {Currencies} from '@common/data/Currencies';
import {styles as dynamicStyles} from './style';

const configs = [
  {header: 'setting.name', property: 'fullName'},
  {header: 'setting.email', property: 'email'},
  {header: 'setting.role', property: 'role'},
  {header: 'setting.actions', actions: ['edit', 'delete']},
];

const Setting = (props) => {
  const {navigation} = props;
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.settingReducers.isDarkMode);
  const isOfflineMode = useSelector(
    (state) => state.settingReducers.isOfflineMode,
  );
  const language = useSelector((state) => state.settingReducers.language);
  const currency = useSelector((state) => state.settingReducers.currency);
  const styles = useDynamicStyleSheet(dynamicStyles);

  const [visibleLangModal, setVisibleLangModal] = useState(false);
  const [visibleCurrencyModal, setVisibleCurrencyModal] = useState(false);
  const [data, setData] = useState([]);
  const staffsReducer = useSelector((state) => state.userReducers.staffs);
  const allStaffs = staffsReducer.result;

  const lightIcArrowRight = require('@assets/icons/ic_arrow_right_black.png');
  const darkIcArrowRight = require('@assets/icons/ic_arrow_right.png');
  const icArrowRight = isDarkMode ? darkIcArrowRight : lightIcArrowRight;

  useEffect(() => {
    const {getStaffs} = ActionCreators;
    if (allStaffs.length === 0 && !staffsReducer.requesting) {
      dispatch(getStaffs());
    }
  }, []);

  useEffect(() => {
    setData(
      allStaffs.map((item) => ({
        ...item,
        fullName: `${item.firstName} ${item.lastName}`,
      })),
    );
  }, [staffsReducer]);

  handleToggleDarkMode = () => {
    const {toggleDarkMode} = ActionCreators;
    dispatch(toggleDarkMode());
  };

  onChangeLang = ({item}) => {
    const {changeLanguage} = ActionCreators;
    dispatch(changeLanguage(item));
  };

  onChangeCurrency = ({item}) => {
    const newCurrency = Currencies.filter((cur) => cur.code === item.value);
    const {changeCurrency} = ActionCreators;
    dispatch(changeCurrency(newCurrency[0]));
  };

  handlePressAction = ({type, item}) => {
    if (type === 'delete') {
      Alert.alert(
        'Delete confirm',
        `Are you sure you want to delete user: ${item.firstName} ${item.lastName}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {text: 'OK', onPress: () => deleteUser(item)},
        ],
        {cancelable: false},
      );
    } else if (type === 'edit') {
      navigation.navigate('EditStaff', {data: item});
    }
  };

  deleteUser = (item) => {
    const {removeStaff, saveStaffDeleted, deleteStaff} = ActionCreators;
    const userId = item.id;
    if (`${userId}`.includes('local-')) {
      return dispatch(removeStaff(userId));
    }
    if (isOfflineMode) {
      return dispatch(saveStaffDeleted(userId));
    }
    dispatch(deleteStaff(userId));
  };

  return (
    <View style={styles.container}>
      {/*
      <TouchableOpacity
        style={styles.btnAddNew}
        onPress={() => navigation.navigate('AddStaff')}>
        <Text style={styles.lbAddNew}>{I18n.t('setting.addUser')}</Text>
      </TouchableOpacity>
      */}

      <View style={styles.settingContainer}>
        <Text style={styles.label}>{I18n.t('setting.changeLanguage')}</Text>
        <TouchableOpacity
          style={styles.btnSelect}
          onPress={() => setVisibleLangModal(true)}>
          <Text style={styles.selectValue}>{language && language.label}</Text>
          <Image source={icArrowRight} style={styles.icArrowRight} />
        </TouchableOpacity>
        <Text style={styles.label}>{I18n.t('setting.changeCurrency')}</Text>
        <TouchableOpacity
          style={styles.btnSelect}
          onPress={() => setVisibleCurrencyModal(true)}>
          <Text style={[styles.selectValue, styles.lbCurrency]}>
            {currency ? currency.code : I18n.t('setting.selectCurrency')}
          </Text>
          <Image source={icArrowRight} style={styles.icArrowRight} />
        </TouchableOpacity>
        <ToggleSwitch
          isOn={isDarkMode}
          onColor="#E0E0E0"
          offColor="#E0E0E0"
          label={I18n.t('setting.darkTheme')}
          labelStyle={styles.label}
          thumbOnStyle={{backgroundColor: '#33B9F7'}}
          thumbOffStyle={{backgroundColor: '#33B9F7'}}
          size="medium"
          onToggle={handleToggleDarkMode}
        />
      </View>
      {/*
      <Table
        data={data}
        configs={configs}
        isDarkMode={isDarkMode}
        handlePressAction={handlePressAction}
      />
      */}
      <ModalSelect
        visible={visibleLangModal}
        onRequestClose={() => setVisibleLangModal(false)}
        isDarkMode={isDarkMode}
        title={I18n.t('setting.titleModalLang')}
        data={languages}
        onSelect={onChangeLang}
        selected={language && language.value}
      />
      <ModalSelect
        visible={visibleCurrencyModal}
        onRequestClose={() => setVisibleCurrencyModal(false)}
        isDarkMode={isDarkMode}
        title={I18n.t('setting.titleModalCurrency')}
        data={Currencies.map((item) => ({label: item.name, value: item.code}))}
        onSelect={onChangeCurrency}
        selected={currency && currency.code}
      />
    </View>
  );
};

export default Setting;
