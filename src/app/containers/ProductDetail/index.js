import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useDynamicStyleSheet} from 'react-native-dark-mode';
import {get} from 'lodash';
import {useDispatch, useSelector} from 'react-redux';
import DropdownAlert from 'react-native-dropdownalert';

import {ActionCreators} from '@actions';
import {Constants, Utils} from '@common';
import I18n from '@common/I18n';
import {styles as dynamicStyles, SMALL_IMAGE_WIDTH} from './style';

const {CLOSE_INTERVAL_ALERT_ERROR} = Constants;

const ProductDetail = (props) => {
  const {navigation} = props;
  const [largePhoto, setLargePhoto] = useState(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [product, setProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const flatListRef = useRef(null);
  const dropdownAlertRef = useRef('');
  const styles = useDynamicStyleSheet(dynamicStyles);
  const dispatch = useDispatch();

  const isOfflineMode = useSelector(
    (state) => state.settingReducers.isOfflineMode,
  );
  const productsReducer = useSelector(
    (state) => state.productReducers.products,
  );
  const currency = useSelector((state) => state.settingReducers.currency);

  useEffect(() => {
    const data = navigation.getParam('product');
    setProduct(data);
    setLargePhoto(get(data, 'images.0.src', ''));
  }, []);

  useEffect(() => {
    if (isDeleting) {
      if (productsReducer.status === 'success') {
        setIsDeleting(false);
        dropdownAlertRef.current.alertWithType(
          'success',
          'Success',
          'Product has successfully deleted.',
        );
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      }
      if (productsReducer.status === 'error') {
        setIsDeleting(false);
        dropdownAlertRef.current.alertWithType(
          'error',
          'Error',
          productsReducer.error,
          {},
          CLOSE_INTERVAL_ALERT_ERROR,
        );
      }
    }
  }, [productsReducer]);

  const goToEditProduct = () => {
    navigation.navigate('EditProduct', {
      data: product,
      refreshData: (data) => setProduct(data),
    });
  };

  const handlePressDelete = () => {
    Alert.alert(
      'Delete confirm',
      `Are you sure you want to delete product: ${product.name}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {text: 'OK', onPress: () => deleteProduct()},
      ],
      {cancelable: false},
    );
  };

  const deleteProduct = () => {
    const {removeProduct, saveProductDeleted} = ActionCreators;
    const productId = product.id;
    setIsDeleting(true);
    if (`${productId}`.includes('local-')) {
      return dispatch(removeProduct(productId));
    }
    if (isOfflineMode) {
      return dispatch(saveProductDeleted(productId));
    }
    dispatch(ActionCreators.deleteProduct(productId));
  };

  const onPressArrow = (increment) => {
    const scrollToIndex = increment + scrollIndex;
    if (scrollToIndex < 0 || scrollToIndex > product.images.length - 4) return;
    scrollSlideToIndex(scrollToIndex);
  };

  const handleScrollImages = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const currentItem = Math.round(x / SMALL_IMAGE_WIDTH);
    scrollSlideToIndex(currentItem);
  };

  const scrollSlideToIndex = (index) => {
    flatListRef.current.scrollToIndex({index});
    setScrollIndex(index);
  };

  const renderImageItem = ({item}) => (
    <TouchableOpacity
      style={styles.smallImageContainer}
      onPress={() => setLargePhoto(item.src)}>
      <Image source={{uri: item.src}} style={styles.smallImage} />
    </TouchableOpacity>
  );

  const renderLeftContainer = () => (
    <View style={styles.leftContainer}>
      <View style={styles.largeImageContainer}>
        {!!largePhoto && (
          <Image source={{uri: largePhoto}} style={styles.largeImage} />
        )}
      </View>
      <View>
        <FlatList
          horizontal
          data={get(product, 'images', [])}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => renderImageItem({item})}
          ItemSeparatorComponent={() => <View style={styles.separatorImage} />}
          showsHorizontalScrollIndicator={false}
          ref={flatListRef}
          onMomentumScrollEnd={handleScrollImages}
        />
        <TouchableOpacity
          onPress={() => onPressArrow(-1)}
          style={styles.btnMoveLeft}>
          <Image
            source={require('@assets/icons/ic_arrow_left.png')}
            style={styles.icArrow}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onPressArrow(1)}
          style={styles.btnMoveRight}>
          <Image
            source={require('@assets/icons/ic_arrow_right.png')}
            style={styles.icArrow}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRightContainer = () => (
    <ScrollView style={styles.rightContainer}>
      <View style={styles.row}>
        <Text style={[styles.column, styles.tableHeader]}>
          {I18n.t('productDetail.category')}
        </Text>
        <Text style={[styles.column, styles.tableRow]}>
          {product.categories && product.categories.length > 0
            ? product.categories[0].name
            : ''}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.column, styles.tableHeader]}>
          {I18n.t('productDetail.sku')}
        </Text>
        <Text style={[styles.column, styles.tableRow]}>{product.sku}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.column, styles.tableHeader]}>
          {I18n.t('productDetail.stockStatus')}
        </Text>
        <Text style={[styles.column, styles.tableRow]}>
          {product.stock_status}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.column, styles.tableHeader]}>
          {I18n.t('productDetail.price')}
        </Text>
        <Text style={[styles.column, styles.tableRow]}>
          {Utils.formatCurrency(product.price, currency)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.column, styles.tableHeader]}>
          {I18n.t('productDetail.salePrice')}
        </Text>
        <Text style={[styles.column, styles.tableRow]}>
          {Utils.formatCurrency(product.sale_price, currency)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.column, styles.tableHeader]}>
          {I18n.t('productDetail.regularPrice')}
        </Text>
        <Text style={[styles.column, styles.tableRow]}>
          {Utils.formatCurrency(product.regular_price, currency)}
        </Text>
      </View>
      <View style={styles.descriptionWrapper}>
        <Text style={styles.tableHeader}>
          {I18n.t('productDetail.description')}:
        </Text>
        <Text style={styles.description}>{product.desc}</Text>
      </View>
    </ScrollView>
  );

  if (!product)
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
          <Text style={styles.lbBack}>{I18n.t('productDetail.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{product.name}</Text>
        <TouchableOpacity
          onPress={goToEditProduct}
          style={[styles.row, styles.btnAction, styles.btnEdit]}>
          <Image
            source={require('@assets/icons/ic_edit_white.png')}
            style={styles.icAction}
          />
          <Text style={styles.lbAction}>{I18n.t('productDetail.edit')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePressDelete}
          style={[styles.row, styles.btnAction]}>
          <Image
            source={require('@assets/icons/ic_delete.png')}
            style={styles.icAction}
          />
          <Text style={styles.lbAction}>{I18n.t('productDetail.delete')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mainContainer}>
        {renderLeftContainer()}
        {renderRightContainer()}
      </View>
      <DropdownAlert ref={dropdownAlertRef} updateStatusBar={false} />
    </View>
  );
};

export default ProductDetail;
