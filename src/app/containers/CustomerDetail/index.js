import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useDynamicStyleSheet, useDarkMode} from 'react-native-dark-mode';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import DropdownAlert from 'react-native-dropdownalert';
import {get} from 'lodash';

import {ActionCreators} from '@actions';
import Table from '@components/Table';
import {Constants, Utils} from '@common';
import I18n from '@common/I18n';
import {styles as dynamicStyles} from './style';

const {CLOSE_INTERVAL_ALERT_ERROR} = Constants;

const configs = [
  {
    header: 'customerDetail.orderNumber',
    property: 'number',
  },
  {
    header: 'customerDetail.created',
    property: 'createdAt',
    format: (value) => {
      return value ? moment(value).format('MM/DD/YYYY') : '';
    },
  },
  {
    header: 'customerDetail.total',
    property: 'payment.total',
    format: (value, currency) => {
      return Utils.formatCurrency(value, currency);
    },
  },
];

const CustomerDetail = (props) => {
  const {navigation} = props;

  const dispatch = useDispatch();
  const styles = useDynamicStyleSheet(dynamicStyles);
  const isDarkMode = useDarkMode();
  const [myOrders, setMyOrders] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [customer, setCustomer] = useState(null);
  const dropdownAlertRef = useRef('');

  const ordersReducer = useSelector((state) => state.orderReducers.orders);
  const customersReducer = useSelector(
    (state) => state.customerReducers.customers,
  );
  const isOfflineMode = useSelector(
    (state) => state.settingReducers.isOfflineMode,
  );
  const currency = useSelector((state) => state.settingReducers.currency);

  const allOrders = ordersReducer.result;

  useEffect(() => {
    const data = navigation.getParam('customer');
    setCustomer(data);
    getOrders();
  }, []);

  useEffect(() => {
    const customer = navigation.getParam('customer');
    let ordersOfCustomer = [];
    if (customer)
      ordersOfCustomer = allOrders.filter(
        (order) => get(order, 'customer.id') === customer.id,
      );
    setMyOrders(ordersOfCustomer);
  }, [ordersReducer]);

  useEffect(() => {
    if (isDeleting) {
      if (customersReducer.status === 'success') {
        setIsDeleting(false);
        dropdownAlertRef.current.alertWithType(
          'success',
          'Success',
          'Customer has successfully deleted.',
        );
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      }
      if (customersReducer.status === 'error') {
        setIsDeleting(false);
        dropdownAlertRef.current.alertWithType(
          'error',
          'Error',
          customersReducer.error,
          {},
          CLOSE_INTERVAL_ALERT_ERROR,
        );
      }
    }
  }, [customersReducer]);

  const handlePressDelete = () => {
    Alert.alert(
      'Delete confirm',
      `Are you sure you want to delete customer: ${customer.name}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {text: 'OK', onPress: () => deleteCustomer()},
      ],
      {cancelable: false},
    );
  };

  const deleteCustomer = () => {
    const {removeCustomer, saveCustomerDeleted} = ActionCreators;
    const customerId = customer.id;
    setIsDeleting(true);
    if (`${customerId}`.includes('local-')) {
      return dispatch(removeCustomer(customerId));
    }
    if (isOfflineMode) {
      return dispatch(saveCustomerDeleted(customerId));
    }
    dispatch(ActionCreators.deleteCustomer(customerId));
  };

  const goToEditCustomer = () => {
    navigation.navigate('EditCustomer', {
      data: customer,
      updateCustomer: (data) => setCustomer(data),
    });
  };

  const getOrders = () => {
    const {getAllOrders} = ActionCreators;
    if (allOrders.length > 0) return;
    dispatch(getAllOrders());
  };

  if (!customer)
    return (
      <View style={{marginTop: 10, alignItems: 'center'}}>
        <ActivityIndicator size="small" />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.headContainer}>
        <TouchableOpacity
          style={styles.btnBack}
          onPress={() => navigation.goBack()}>
          <Text style={styles.lbBack}>{I18n.t('customerDetail.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{I18n.t('customerDetail.title')}</Text>
      </View>
      <ScrollView style={styles.mainContainer}>
        <View style={styles.row}>
          <View style={[styles.row, styles.userInfo]}>
            <View style={styles.avatarWrapper}>
              {!!customer.avatar_url && (
                <Image
                  source={{uri: customer.avatar_url}}
                  style={styles.avatar}
                />
              )}
            </View>
            <View>
              <Text style={styles.userName}>
                {customer.first_name} {customer.last_name}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={goToEditCustomer}
            style={[styles.row, styles.btnAction, styles.btnEdit]}>
            <Image
              source={require('@assets/icons/ic_edit_white.png')}
              style={styles.icAction}
            />
            <Text style={styles.lbAction}>{I18n.t('customerDetail.edit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, styles.btnAction]}
            onPress={handlePressDelete}>
            <Image
              source={require('@assets/icons/ic_delete.png')}
              style={styles.icAction}
            />
            <Text style={styles.lbAction}>
              {I18n.t('customerDetail.delete')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.userInfoDetail}>
          <View style={styles.row}>
            <Image
              style={styles.fieldIcon}
              source={require('@assets/icons/ic_location.png')}
            />
            <Text style={styles.fieldValue}>{customer.shipping.address_1}</Text>
          </View>
          {/*
           <TouchableOpacity style={styles.btnViewMap}>
            <Text style={styles.lbViewMap}>
              {I18n.t('customerDetail.viewMap')}
            </Text>
          </TouchableOpacity>
          */}

          <View style={styles.row}>
            <Image
              style={styles.fieldIcon}
              source={require('@assets/icons/ic_phone.png')}
            />
            <Text style={styles.fieldValue}>{customer.billing.phone}</Text>
          </View>

          <View style={styles.row}>
            <Image
              style={styles.fieldIcon}
              source={require('@assets/icons/ic_email.png')}
            />
            <Text style={styles.fieldValue}>{customer.email}</Text>
          </View>
        </View>
        <Table
          data={myOrders}
          configs={configs}
          isDarkMode={isDarkMode}
          ListFooterComponent={
            ordersReducer.requesting && (
              <View style={styles.icLoadingMore}>
                <ActivityIndicator size="small" />
              </View>
            )
          }
          scrollEnabled={false}
          currency={currency}
        />
      </ScrollView>
      <DropdownAlert ref={dropdownAlertRef} updateStatusBar={false} />
    </View>
  );
};

export default CustomerDetail;
