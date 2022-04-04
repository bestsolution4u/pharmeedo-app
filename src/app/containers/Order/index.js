import React, {useState, useEffect} from 'react';
import {
  View,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useDynamicStyleSheet} from 'react-native-dark-mode';
import ScrollableTabView, {
  DefaultTabBar,
} from 'react-native-scrollable-tab-view';
import {useDispatch, useSelector} from 'react-redux';
import {slice, get, sumBy} from 'lodash';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import {ActionCreators} from '@actions';
import {Constants, Utils} from '@common';
import I18n from '@common/I18n';
import SearchInput from '@components/SearchInput';
import {styles as dynamicStyles} from './style';

const {NUMBER_ITEMS_PER_PAGE, MIN_LENGTH_SEARCH, VAT} = Constants;

const OrderItem = ({styles, item, onPress, selected, currency}) => {
  return (
    <TouchableOpacity style={styles.order} onPress={onPress}>
      <Text style={[styles.lbOrderId, selected && styles.lbOrderIdActive]}>
        {item.number}
      </Text>
      <Text
        style={[styles.lbOrderTotalAmount, selected && styles.lbOrderIdActive]}>
        {Utils.formatCurrency(get(item, 'total', 0), currency, {
          precision: 0,
        })}
      </Text>
    </TouchableOpacity>
  );
};

const renderTabBar = (styles) => (name, page, isTabActive, onPressHandler) => {
  return (
    <TouchableOpacity
      style={{flex: 1}}
      key={name}
      onPress={() => onPressHandler(page)}>
      <View style={[styles.tab, isTabActive && styles.tabActiveStyle]}>
        <Text
          style={[styles.tabBarText, isTabActive && styles.tabBarActiveText]}>
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const HistoryTab = ({
  styles,
  data,
  onPressItem,
  handleLoadMore,
  setDatePickerVisible,
  dateFilter,
  selectedItem,
  onChangeTextSearch,
  isLoading,
  currency,
}) => {
  return (
    <View style={styles.searchContainer}>
      <SearchInput
        placeholder={I18n.t('order.searchOrders')}
        onChangeText={onChangeTextSearch}
      />
      <TouchableOpacity
        style={styles.btnCalendar}
        onPress={setDatePickerVisible}>
        <Image
          source={require('@assets/icons/ic_calendar.png')}
          style={styles.icCalendar}
        />
        <Text style={styles.lbChooseDate}>
          {dateFilter
            ? moment(dateFilter).format('DD-MM-YYYY')
            : I18n.t('order.chooseDate')}
        </Text>
      </TouchableOpacity>
      <FlatList
        data={data}
        renderItem={({item}) => (
          <OrderItem
            styles={styles}
            item={item}
            selected={item.id === selectedItem}
            currency={currency}
            onPress={() => onPressItem({item})}
          />
        )}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        extraData={selectedItem}
        ListFooterComponent={
          isLoading && (
            <View style={styles.icLoadingMore}>
              <ActivityIndicator size="small" />
            </View>
          )
        }
      />
    </View>
  );
};

const renderOrderDetail = ({styles, data, currency}) => {
  let subTotal = sumBy(data.line_items, 'total');
  const vat = Math.round(VAT * subTotal * 10) / 10;
  let total = get(data, 'total', 0);
  let discount = get(data, 'discount_total', 0);

  return (
    <ScrollView style={styles.orderDetailContainer}>
      <Text style={styles.fieldLabel}>{I18n.t('order.customer')}</Text>
      <Text style={styles.fieldValue}>
        {get(data, 'billing.first_name', '')}{' '}
        {get(data, 'billing.last_name', '')}
      </Text>

      <Text style={styles.fieldLabel}>{I18n.t('order.dateTime')}</Text>
      <Text style={styles.fieldValue}>
        {moment(data.date_created).format('dddd, MMMM DD, YYYY HH:mm')}
      </Text>

      <Text style={styles.fieldLabel}>{I18n.t('order.shippingAddress')}</Text>
      <View style={styles.fieldRow}>
        <Image
          style={styles.fieldIcon}
          source={require('@assets/icons/ic_location.png')}
        />
        <Text style={styles.fieldValue}>
          {get(data, 'shipping.address_1', '')}
        </Text>
      </View>
      <TouchableOpacity style={styles.btnViewMap}>
        <Text style={styles.lbViewMap}>{I18n.t('order.viewMap')}</Text>
      </TouchableOpacity>

      <Text style={styles.fieldLabel}>{I18n.t('order.phone')}</Text>
      <View style={styles.fieldRow}>
        <Image
          style={styles.fieldIcon}
          source={require('@assets/icons/ic_phone.png')}
        />
        <Text style={styles.fieldValue}>{get(data, 'billing.phone', '')}</Text>
      </View>

      <Text style={styles.fieldLabel}>{I18n.t('order.mail')}</Text>
      <View style={styles.fieldRow}>
        <Image
          style={styles.fieldIcon}
          source={require('@assets/icons/ic_email.png')}
        />
        <Text style={styles.fieldValue}>{get(data, 'billing.email', '')}</Text>
      </View>

      <Text style={styles.fieldLabel}>{I18n.t('order.items')}</Text>
      {data.line_items.map((item, index) => (
        <View style={styles.fieldRow} key={index.toString()}>
          <Image source={{uri: ''}} style={styles.itemImage} />
          <Text style={styles.itemName}>{get(item, 'name', '')}</Text>
          <Text style={styles.itemQuantity}>x{get(item, 'quantity', '')}</Text>
          <Text style={styles.price}>
            {Utils.formatCurrency(get(item, 'total', 0), currency)}
          </Text>
        </View>
      ))}
      <View style={styles.borderLine} />
      <View style={styles.subTotalContainer}>
        <View style={[styles.fieldRow, styles.subtotalItem]}>
          <Text style={styles.lbSubtotal}>{I18n.t('order.subtotal')}</Text>
          <Text style={styles.price}>
            {Utils.formatCurrency(subTotal, currency)}
          </Text>
        </View>
        {!!discount && (
          <View style={[styles.fieldRow, styles.subtotalItem]}>
            <Text style={styles.lbSubtotal}>{I18n.t('order.coupon')}</Text>
            <Text style={styles.price}>
              - {Utils.formatCurrency(discount, currency)}
            </Text>
          </View>
        )}
        <View style={[styles.fieldRow, styles.subtotalItem]}>
          <Text style={styles.lbSubtotal}>{I18n.t('order.vat')}</Text>
          <Text style={styles.price}>
            {Utils.formatCurrency(vat, currency)}
          </Text>
        </View>
        <View style={[styles.fieldRow, styles.subtotalItem]}>
          <Text style={styles.lbSubtotal}>{I18n.t('order.total')}</Text>
          <Text style={styles.price}>
            {Utils.formatCurrency(total, currency)}
          </Text>
        </View>

        <View style={styles.borderLine} />
        <View style={styles.fieldRow}>
          <Text style={styles.lbPaidByCustomer}>
            {I18n.t('order.paidByCustomer')}
          </Text>
          <TouchableOpacity style={styles.btnPaid}>
            <Text style={styles.lbPaid}>
              {Utils.formatCurrency(total, currency)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const Order = () => {
  const styles = useDynamicStyleSheet(dynamicStyles);
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [orderDetail, setOrderDetail] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);
  const [textSearch, setTextSearch] = useState('');
  const ordersReducer = useSelector((state) => state.orderReducers.orders);
  const allOrders = ordersReducer.result;
  const currency = useSelector((state) => state.settingReducers.currency);

  useEffect(() => {
    const {getAllOrders} = ActionCreators;
    if (allOrders.length === 0 && !ordersReducer.requesting) {
      dispatch(getAllOrders());
    }
  }, []);

  useEffect(() => {
    if (textSearch.length >= MIN_LENGTH_SEARCH || dateFilter) {
      search(dateFilter, textSearch);
    } else {
      initData();
    }
  }, [ordersReducer]);

  const initData = () => {
    setPage(1);
    setData(slice(allOrders, 0, NUMBER_ITEMS_PER_PAGE));
    setOrderDetail(get(allOrders, '0'));
  };

  const handleLoadMore = () => {
    const start = page * NUMBER_ITEMS_PER_PAGE;
    const end = (page + 1) * NUMBER_ITEMS_PER_PAGE;
    const dataPage = slice(allOrders, start, end);
    if (
      data.length === allOrders.length ||
      isLoadingMore ||
      textSearch.length >= MIN_LENGTH_SEARCH ||
      dateFilter
    ) {
      return;
    }

    setIsLoadingMore(true);
    setPage(page + 1);
    setData([...data, ...dataPage]);
    setTimeout(() => setIsLoadingMore(false), 2000);
  };

  const handleConfirmDatePicker = (date) => {
    setDatePickerVisible(false);
    setDateFilter(date);
    search(date, textSearch);
  };

  const handleCancelDatePicker = () => {
    setDatePickerVisible(false);
    if (dateFilter) {
      search(null, textSearch);
      setDateFilter(null);
    }
  };

  const onChangeSearch = (text = '') => {
    setTextSearch(text.trim());
    search(dateFilter, text.trim());
  };

  const search = (date, text) => {
    let result = allOrders;
    if (date) {
      result = allOrders.filter((item) =>
        moment(item.createdAt).isSame(moment(date), 'day'),
      );
    }
    if (text.length > 1) {
      result = result.filter((item) =>
        Utils.searchObject(
          item,
          ['customer.name', 'customer.email', 'customer.address', 'number'],
          text,
        ),
      );
    }
    if (!date && text.length < MIN_LENGTH_SEARCH) {
      initData();
    }
    setData(result);
    setOrderDetail(get(result, '0'));
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <ScrollableTabView
          initialPage={1}
          tabBarUnderlineStyle={{height: 0}}
          renderTabBar={() => (
            <DefaultTabBar
              renderTab={renderTabBar(styles)}
              style={styles.tabs}
            />
          )}
          contentProps={{pageMargin: 16, scrollEnabled: false}}>
          <View tabLabel={I18n.t('order.pending')} />
          <HistoryTab
            data={data}
            styles={styles}
            tabLabel={I18n.t('order.history')}
            onPressItem={({item}) => setOrderDetail(item)}
            handleLoadMore={handleLoadMore}
            setDatePickerVisible={() => setDatePickerVisible(true)}
            dateFilter={dateFilter}
            selectedItem={orderDetail && orderDetail.id}
            onChangeTextSearch={onChangeSearch}
            isLoading={isLoadingMore || ordersReducer.requesting}
            currency={currency}
          />
        </ScrollableTabView>
      </View>
      <View style={styles.rightContainer}>
        {orderDetail &&
          renderOrderDetail({styles, data: orderDetail, currency})}
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDatePicker}
        onCancel={handleCancelDatePicker}
      />
    </View>
  );
};

export default Order;
